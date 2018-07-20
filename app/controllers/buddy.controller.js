const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment');
      _User = require('../models/user'),
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification');

const buddyModule = {
    searchBuddiesByName : wrapper(function*( req, res ) {
        var name = req.body.search;
        var user = req.session.user;
        
        var reqests = user.buddyrequests;
        var pendings = user.pendingrequests;
        var buddies = user.buddies;
        var exceptsOfSearch = [].concat(reqests, pendings, buddies);
        
        var results = yield _User.findUsersByName( name, user );
        var filtered = [];
        for( var index = 0; index < results.length; index ++ ) 
        {
            if ( !utilities.isUserContainedException(exceptsOfSearch, results[index]) ) {
                filtered.push(results[index]);
            }
        }
        console.log(exceptsOfSearch)
        return res.send({ success : true, result : filtered, message : 'Token Verified!', error : {} });
    }),
    
    getBuddyAvailability : wrapper(function*( req, res ) {
        var buddyId = req.body.buddyId;
        var buddyStatus = yield _Session.getStatusByUserID( buddyId )

        return res.send({ success : true, availability : buddyStatus });
    }),

    getBuddies : wrapper(function*(req, res) {
        var user = req.session.user;
        return res.send({ success : true, buddies : user.buddies, message : 'Token Verified!', error : {} });
    }),

    getBuddyRequests : wrapper(function*( req, res ) {
        var user = req.session.user;
        return res.send({ success : true, requests : user.buddyrequests, message : 'Token Verified!', error : {} });
    }),

    getBuddyPendings : wrapper(function*( req, res ) {
        var user = req.session.user;
        return res.send({ success : true, requests : user.pendingrequests, message : 'Token Verified!', error : {} });
    }),

    sendInvitation : wrapper(function*( req, res ) {
        var buddyId = req.body.buddyId;
        var user = req.session.user;
        var buddy = yield _User.findOneById(buddyId);

        if( buddy ) {
            var userPendingRequests = Object.assign([],user.pendingrequests);
            userPendingRequests.push( buddy._id );
            var buddyRequests = Object.assign([],buddy.buddyrequests);
            buddyRequests.push( user._id );

            user.updateField('pendingrequests', userPendingRequests);
            buddy.updateField('buddyrequests', buddyRequests);
            yield user.saveToDataBase();
            yield buddy.saveToDataBase();

            var buddyPushToken = yield _Session.getPushTokenByUserID( buddy._id );

            var buddyNotification = yield _Notification.findOneById(buddy.notificationId);
            buddyNotification.putNotification({
                title : 'Buddy Request',
                description : `${user.profile.firstName} + sent you buddy request!`,
                datetime : moment(Date.now()).utc().format(),
                image : ''
            })
            yield buddyNotification.saveToDataBase();

            if( buddyPushToken !== '' ) {
                console.log("Sending push notification ... ");
                var data = {
                    contents: { 'en' : `${user.profile.firstName} + sent you buddy request!` },
                    headings: { 'en' : 'Buddy Request'},
                    ios_badgeType : 'Increase',
                    ios_badgeCount : 1,
                    include_player_ids : [ buddyPushToken ]
                }
                var pushRes = yield _PushNotification.sendPush( data ); //Send Push notification to buddy
                if ( pushRes.errors ) {
                    return res.send({ success : true, message : 'Sending push notification failed', error : pushRes.errors });
                }
                else {
                    return res.send({ success : true, message : 'Successfully invited!', error : {} });
                }
            }
            else {
                return res.send({ success : true, message : 'Successfully invited!', error : {} });
            }
        }
        else {
            console.log('Buddy not exist!');
            return res.send({ success : false, message : 'Buddy is not exist!', error : {} });
        }
    }),

    acceptInvitation : wrapper(function*( req, res ) {
        var buddyId = req.body.buddyId;
        var user = req.session.user;
        var buddy = yield _User.findOneById(buddyId);

        if( buddy ) {
            var userRequests = Object.assign([], user.buddyrequests);
            var buddyPendings = Object.assign([], buddy.pendingrequests);
            var userReqIndex = userRequests.indexOf(buddy._id);
            var buddyPendingIndex = buddyPendings.indexOf(user._id);
            if( userReqIndex !== -1 && buddyPendingIndex !== -1 ) {
                userRequests.splice( userReqIndex, 1 );
                buddyPendings.splice( buddyPendingIndex, 1 );

                user.updateField('buddyrequests', userRequests);
                buddy.updateField('pendingrequests', buddyPendings);

                var userBuddies = Object.assign([], user.buddies);
                var buddyBuddies = Object.assign([], buddy.buddies);

                userBuddies.push(buddy._id);
                buddyBuddies.push(user._id);

                user.updateField('buddies', userBuddies);
                buddy.updateField('buddies', buddyBuddies);

                yield user.saveToDataBase();
                yield buddy.saveToDataBase();

                var buddyPushToken = yield _Session.getPushTokenByUserID( buddy._id );

                var buddyNotification = yield _Notification.findOneById(buddy.notificationId);
                buddyNotification.putNotification({
                    title : 'Invitation accepted',
                    description : `${user.profile.firstName} + accepted your buddy invitation!`,
                    datetime : moment(Date.now()).utc().format(),
                    image : ''
                })
                yield buddyNotification.saveToDataBase();
                
                if ( buddyPushToken !== '' ) {
                    var data = {
                        contents: { 'en' : `${user.profile.firstName} + accepted your buddy invitation!` },
                        headings: { 'en' : 'Invitation accepted'},
                        ios_badgeType : 'Increase',
                        ios_badgeCount : 1,
                        include_player_ids : [buddyPushToken]
                    }
                    var pushRes = yield _PushNotification.sendPush( data );
                    if( pushRes.errors ) {
                        return res.send({ success : true , message : 'Sending push notification failed!' , error : pushRes.errors });
                    }
                    else {
                        return res.send({ success : true , message : 'Success' , error : {} });
                    }
                }
                else {
                    return res.send({ success : true , message : 'Success' , error : {} });
                }
            }
            else {
                return res.send({ success : false , message : 'No Pending or Request from this buddy' , error : {} });
            }
        }
        else {
            return res.send({ success : false, message : 'Buddy is not exist!', error : {} });
        }
    }),

    declineInvitation : wrapper(function*( req, res ) {
        var buddyId = req.body.buddyId;
        var user = req.session.user;
        var buddy = yield _User.findOneById(buddyId);

        if( buddy ) {
            var userRequests = Object.assign([], user.buddyrequests);
            var buddyPendings = Object.assign([], buddy.pendingrequests);
            var userReqIndex = userRequests.indexOf(buddy._id);
            var buddyPendingIndex = buddyPendings.indexOf(user._id);
            if( userReqIndex !== -1 && buddyPendingIndex !== -1 ) {
                userRequests.slice( userReqIndex, 1 );
                buddyPendings.slice( buddyPendingIndex, 1 );

                user.updateField('buddyrequests', userRequests);
                buddy.updateField('pendingrequests', buddyPendings);

                yield user.saveToDataBase();
                yield buddy.saveToDataBase();

                var buddyPushToken = yield _Session.getPushTokenByUserID( buddy._id );
                
                var buddyNotification = yield _Notification.findOneById(buddy.notificationId);
                buddyNotification.putNotification({
                    title : 'Invitation declined!',
                    description : `${user.profile.firstName} + decline your buddy invitation!`,
                    datetime : moment(Date.now()).utc().format(),
                    image : ''
                })
                yield buddyNotification.saveToDataBase();

                if ( buddyPushToken !== '' ) {
                    var data = {
                        contents: { 'en' : `${user.profile.firstName} + decline your buddy invitation!` },
                        headings: { 'en' : 'Invitation declined!'},
                        ios_badgeType : 'Increase',
                        ios_badgeCount : 1,
                        include_player_ids : [buddyPushToken]
                    }
                    var pushRes = yield _PushNotification.sendPush( data );
                    if( pushRes.errors ) {
                        return res.send({ success : true , message : 'Sending push notification failed!' , error : pushRes.errors });
                    }
                    else {
                        return res.send({ success : true , message : 'Success' , error : {} });
                    }
                }
                else {
                    return res.send({ success : true , message : 'Success' , error : {} });
                }
            }
            else {
                return res.send({ success : false , message : 'No Pending or Request from this buddy' , error : {} });
            }
        }
        else {
            return res.send({ success : false, message : 'Buddy is not exist!', error : {} });
        }
    }),

    getBuddyInfo : wrapper(function*( req, res ) {
        var user = req.session.user;
        var buddyId = req.body.buddyId;
        var buddy = yield _User.findOneById(buddyId);

        if( buddy ) {
            return res.send({ success : true, buddy : buddy._doc, message : 'Success', error : {} })
        }
        else {
            return res.send({ success : false, message : 'Buddy is not exist!', error : {} });
        }
    }),

    getAllBuddies : wrapper(function*(req, res) {
        var buddies = yield new Promise( ( resolve, reject ) => {
            _User.find((error, users) => {
                if(error) reject(error)
                else resolve(users)
            })
        })
        buddies = buddies.filter( element => {
            return !element.isAdmin
        })
        return res.send({ success : true, buddies : buddies })
    })
}

module.exports = buddyModule;