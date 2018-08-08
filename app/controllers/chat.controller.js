const _Chat = require('../models/chat'),
      _User = require('../models/user'),
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification'),
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
            image : '',
            timestamp : moment(Date.now()).utc().format(),
            isread : false
        })
        yield buddyNotification.saveToDataBase();

        if ( buddyPushToken !== '' ) yield _PushNotification.send([buddyPushToken], `${user.profile.firstName} created chat with you!`, 'New chat created!')
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