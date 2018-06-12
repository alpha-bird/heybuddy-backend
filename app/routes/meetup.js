const meetupController = require('../controllers/meetup.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
      router.post('/meetup/media/upload', _AuthCheck, meetupController.uploadMedia);
}