const notificationController = require('../controllers/notification.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.get('/notification', _AuthCheck, notificationController.getMyNotifications);
}