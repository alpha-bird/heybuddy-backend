const feedbackController = require('../controllers/feedback.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/heybuddy/feedback', _AuthCheck, feedbackController.createFeedback);
    router.get('/heybuddy/feedback', _AuthCheck, feedbackController.getFeedback);
}