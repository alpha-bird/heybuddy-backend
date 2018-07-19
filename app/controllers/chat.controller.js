const _Chat = require('../models/chat'),
      _User = require('../models/user'),
      _Session = require('../models/session'),
      wrapper = require('co-express'),
      utilities = require('../lib/utilities');

const chatModule = {
    createChat : wrapper(function*(req, res) {
        var newChat = new _Chat({
            channel : 'channel-' + utilities.getBlobNameWillUpload(), 
            organizer : req.session.user._doc,
            buddy : req.body.buddy
        });

        yield newChat.saveToDataBase();

        var user = req.session.user;
        var buddy = yield _User.findOneById(req.body.buddy._id);

        var newUserChats = user.chats;
        newUserChats.push(newChat._id);
        user.updateField('chats', newUserChats);
        yield user.saveToDataBase();

        var newBuddyChats = buddy.chats;
        newBuddyChats.push(newChat._id);
        buddy.updateField('chats', newBuddyChats);
        yield buddy.saveToDataBase();

        newChat.updateField('organizer', user._doc);
        newChat.updateField('buddy', buddy._doc);
        yield newChat.saveToDataBase()

        var buddyPushToken = yield _Session.getPushTokenByUserID( buddy._id );
        if ( buddyPushToken !== '' ) {
            var data = {
                contents: { 'en' : user.profile.firstName + ' created chat with you!' },
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
        res.send({ success : true, chat : chat._doc });
    })
}

module.exports = chatModule;