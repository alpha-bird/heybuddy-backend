const messageController = require('../controllers/message.controller'),
    _AuthCheck = require('../auth');

module.exports = ( router ) => {
      router.post('/message/upload', _AuthCheck, messageController.uploadMedia);
}