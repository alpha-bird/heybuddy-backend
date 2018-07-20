const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _User = require('../models/user'),
      _Meetup = require('../models/meetup'),
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification');

function sendPushnotification( tokenIds, contents, headings ) {
    return new Promise( (resolve ,reject) => {
        var data = {
            contents: { 'en' : contents },
            headings: { 'en' : headings },
            ios_badgeType : 'Increase',
            ios_badgeCount : 1,
            include_player_ids : tokenIds
        }
        _PushNotification.sendPush( data ).then( errors => {
            if( errors ) {
                console.log('Sending push notification failed!', pushRes.errors)
                resolve(false)
            }
            else {
                console.log('Sending push notification successed!')
                resolve(true)
            }
        })
    })
}

const meetupModule = {
    createMeetUp : wrapper(function*( req, res ) {
        var meetupData = req.body.meetupInfo;
        var user = req.session.user;

        var data = {
            title : meetupData.title,
            description : meetupData.description,
            //location : {
                //latitude : 
                //longitude :
            //}
            photos : meetupData.photos,
            videos : meetupData.videos,
            createdTime : moment(Date.now()).utc().format(),
            createdBy : user._id,
            members : [],
            memberLength : 0,
            invitedMembers : [],
            invitedMemberLength : 0,
            checkedIn : [],
            going : [],
            ispublic : meetupData.ispublic,
            pollResult : {
                agreedMembers : [],
                disagreedMembers : [],
                notVotedMembers : [],
                percentageOfAgree : 0,
                percentageOfDisagree : 0,
                percentageOfNotVoted : 0
            }
        }

        var newMeetUp = new _Meetup(data)
        yield newMeetUp.saveToDataBase()
        
        var userPushtoken = yield _Session.getPushTokenByUserID( user._id );
        
        var notification = yield _Notification.findOneById( user.notificationId )
        notification.putNotification({
            title : 'Meetup started!',
            description : `${user.profile.firstName}, You just created new Meetup!!`,
            datetime : moment(Date.now()).utc().format(),
            image : ''
        })
        yield notification.saveToDataBase()

        if( userPushtoken !== '' ) yield sendPushnotification( [ userPushtoken ], `${user.profile.firstName}, You just created new Meetup!!`, 'Meetup started!')

        res.send({ success : true, meetup : newMeetUp._doc })
    }),

    getPublicMeetups : wrapper(function*(req, res) {
        var publicMeetups = yield _Meetup.findAllPublic()
        for( var i = 0; i < publicMeetups.length ; i ++ ) {
            publicMeetups[i].createdBy = yield _User.findOneById(publicMeetups[i].createdBy)
        }
        res.send({ success : true, meetups : publicMeetups })
    }),
    
    getAllMeetups : wrapper(function*(req, res) {
        var allMeetups = yield _Meetup.findAll()

        for( var i = 0; i < allMeetups.length ; i ++ ) {
            allMeetups[i].createdBy = yield _User.findOneById(allMeetups[i].createdBy)
        }
        res.send({ success : true, meetups : allMeetups })
    }),

    gotoMeetup : wrapper(function*(req, res) {
        var user = req.session.user
        var meetupId = req.body.meetupId

        var meetupObj = yield _Meetup.findOneById(meetupId)

        var updatedMembers = Object.assign([], meetupObj.members)
        updatedMembers.push(user._id)

        var updatedGoing = Object.assign([], meetupObj._doc.going)
        updatedGoing.push(user._id)

        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        updatednotVotedMembers.push(user._id)

        var updatedPollResult = {
                agreedMembers : meetupObj.pollResult.agreedMembers,
                disagreedMembers : meetupObj.pollResult.disagreedMembers,
                notVotedMembers : updatednotVotedMembers,
                percentageOfAgree : (meetupObj.pollResult.agreedMembers.length/(meetupObj._doc.memberLength + 1)) * 100,
                percentageOfDisagree : (meetupObj.pollResult.disagreedMembers.length/(meetupObj._doc.memberLength + 1)) * 100,
                percentageOfNotVoted : (updatednotVotedMembers.length/(meetupObj._doc.memberLength + 1)) * 100
        }

        meetupObj.updateField('members', updatedMembers)
        meetupObj.updateField('memberLength', meetupObj._doc.memberLength + 1)
        meetupObj.updateField('going', updatedGoing)
        meetupObj.updateField('pollResult', updatedPollResult)

        yield meetupObj.saveToDataBase()

        res.send({ success : true, meetup : meetupObj._doc })
    }),

    addBuddy : wrapper(function*(req, res) {
        var meetupId = req.body.meetupId
        var buddies = req.body.buddies

        var meetupObj = yield _Meetup.findOneById(meetupId)
        var updatedGoing = Object.assign([], meetupObj._doc.going)
        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        for(var i = 0; i < buddies.length; i ++) {
            updatedGoing.push(buddies[i])
            updatednotVotedMembers.push(buddies[i])
        }

        var updatedPollResult = {
            agreedMembers : meetupObj.pollResult.agreedMembers,
            disagreedMembers : meetupObj.pollResult.disagreedMembers,
            notVotedMembers : updatednotVotedMembers,
            percentageOfAgree : (meetupObj.pollResult.agreedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100,
            percentageOfDisagree : (meetupObj.pollResult.disagreedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100,
            percentageOfNotVoted : (updatednotVotedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100
        }
        meetupObj.updateField('going', updatedGoing)
        meetupObj.updateField('pollResult', updatedPollResult)
        yield meetupObj.saveToDataBase()

        res.send({ success : true, meetup : meetupObj._doc })
    }),

    createPoll : wrapper(function*(req, res) {
        var user = req.session.user
        var meetupId = req.body.meetupId
        var poll = req.body.poll

        var meetupObj = yield _Meetup.findOneById(meetupId)
        var updatedagreedMembers = []
        var updateddisagreedMembers = []

        if(poll) {
            updatedagreedMembers = Object.assign([], meetupObj.pollResult.agreedMembers)
            updatedagreedMembers.push(user._id)
            
            updateddisagreedMembers = Object.assign([], meetupObj.pollResult.disagreedMembers)
        }
        else {
            updatedagreedMembers = Object.assign([], meetupObj.pollResult.agreedMembers)
            
            updateddisagreedMembers = Object.assign([], meetupObj.pollResult.disagreedMembers)
            updateddisagreedMembers.push(user._id)
        }
        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        var index = updatednotVotedMembers.indexOf(user._id)
        updatednotVotedMembers.splice(index, 1)

        var updatedPollResult = {
            agreedMembers : updatedagreedMembers,
            disagreedMembers : updateddisagreedMembers,
            notVotedMembers : updatednotVotedMembers,
            percentageOfAgree : (updatedagreedMembers.length / meetupObj._doc.memberLength) * 100,
            percentageOfDisagree : (updateddisagreedMembers.length / meetupObj._doc.memberLength) * 100,
            percentageOfNotVoted : (updatednotVotedMembers.length / meetupObj._doc.memberLength) * 100
        }
        meetupObj.updateField('pollResult', updatedPollResult)
        yield meetupObj.saveToDataBase()

        var userPushtoken = yield _Session.getPushTokenByUserID( user._id )
        
        var notification = yield _Notification.findOneById( user.notificationId )
        notification.putNotification({
            title : 'Poll created!',
            description : `${user.profile.firstName}, You have created poll`,
            datetime : moment(Date.now()).utc().format(),
            image : ''
        })
        yield notification.saveToDataBase()

        if( userPushtoken !== '' ) yield sendPushnotification( [ userPushtoken ], `${user.profile.firstName}, You have created poll`, 'Poll created!')

        res.send({ success : true, meetup : meetupObj._doc })
    }),
    
    addFeedback : wrapper(function*(req, res) {
        var meetupId = req.body.meetupId
        var meetupObj = yield _Meetup.findOneById(meetupId)

        var newFeedback = {
            rating : req.body.rating,
            feedback : req.body.feedback,
            feedbackFrom : req.session.user._id
        }
        meetupObj.addFeedback( newFeedback )
        yield meetupObj.saveToDataBase()

        res.send({
            success : true,
            meetup : meetupObj
        })
    }),

    uploadMedia : wrapper(function*(req, res) {
        var meetup_media_bucket = 'meetup-media';
        var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
        var data = req.body.content;
        var params = { 
            Bucket: meetup_media_bucket, 
            Key: key, 
            Body: data,
            ACL : 'public-read'
        };
        var upload = ( params ) => {
            return new Promise((resolve, reject) => {
                S3.putObject(params, (err, data) => {
                    if(err) reject(err)
                    else resolve(data)
                })
            })
        }

        var status = yield upload(params)
        res.send({ success : true, data : status })
    })
}

module.exports = meetupModule;