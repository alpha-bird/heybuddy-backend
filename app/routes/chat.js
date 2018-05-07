const chatController = require('../controllers/chat.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/chat/new', _AuthCheck, chatController.createChat);
    router.post('/chat', _AuthCheck, chatController.getAllChats);
    router.post('/chat/chatinfo', _AuthCheck, chatController.getChatInformation);
}