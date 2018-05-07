const _Chat = require('../models/chat'),
      _User = require('../models/user'),
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