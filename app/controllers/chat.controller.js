const _Chat = require('../models/chat'),
      _User = require('../models/user'),
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      wrapper = require('co-express'),
      moment = require('moment'),
      utilities = require('../lib/utilities');

const chatModule = {
    createChat : wrapper(function*(req, res) {
        var newChat = new _Chat({
            channel : 'channel-' + utilities.getBlobNameWillUpload(), 
            organizer : req.session.user._id,
            buddy : req.body.buddyId
        });

        yield newChat.saveToDataBase();

        var user = req.session.user;
        var buddy = yield _User.findOneById(req.body.buddyId);

        var newUserChats = user.chats;
        newUserChats.push(newChat._id);
        user.updateField('chats', newUserChats);
        yield user.saveToDataBase();

        var newBuddyChats = buddy.chats;
        newBuddyChats.push(newChat._id);
        buddy.updateField('chats', newBuddyChats);
        yield buddy.saveToDataBase();

        var buddyPushToken = yield _Session.getPushTokenByUserID( buddy._id );
        
        var buddyNotification = yield _Notification.findOneById(buddy.notificationId);
        buddyNotification.putNotification({
            title : 'New chat created!',
            description : `${user.profile.firstName} + created chat with you!`,
            datetime : moment(Date.now()).utc().format(),
            image : ''
        })
        yield buddyNotification.saveToDataBase();

        if ( buddyPushToken !== '' ) {
            var data = {
                contents: { 'en' : `${user.profile.firstName} created chat with you!` },
                headings: { 'en' : 'New chat created!'},
                ios_badgeType : 'Increase',
                ios_badgeCount : 1,
                include_player_ids : [buddyPushToken]
            }
            var pushRes = yield _PushNotification.sendPush( data );
            if( pushRes.errors ) {
                console.log('Sending push notification failed!', pushRes.errors)
            }
            else {
                console.log('Sending push notification successed!')
            }
        }

        res.send({ success : true });
    }),

    getAllChats : wrapper(function*( req, res ) {
        var user = req.session.user;

        res.send({ success : true, chats : user.chats })
    }),

    getChatInformation : wrapper(function*( req, res ) {
        var chatId = req.body.chatId;

        var chat = yield _Chat.findOneById( chatId );

        chat.organizer = yield _User.findOneById( chat.organizer )
        chat.buddy = yield _User.findOneById( chat.buddy )
        
        res.send({ success : true, chat : chat });
    })
}

module.exports = chatModule;