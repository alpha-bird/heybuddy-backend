const meetupController = require('../controllers/meetup.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
      router.post('/meetup/create', _AuthCheck, meetupController.createMeetUp);
      router.post('/meetup/public', _AuthCheck, meetupController.getPublicMeetups);
      router.post('/meetups', _AuthCheck, meetupController.getAllMeetups);
      router.post('/meetup/goto', _AuthCheck, meetupController.gotoMeetup);
      router.post('/meetup/poll/create', _AuthCheck, meetupController.createPoll);
      router.post('/meetup/addbuddy', _AuthCheck, meetupController.addBuddy);
      router.post('/meetup/addfeedback', _AuthCheck, meetupController.addFeedback);
      router.post('/meetup/media/upload', _AuthCheck, meetupController.uploadMedia);
}