const newsfeedController = require('../controllers/newsfeed.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/newsfeed/post', _AuthCheck, newsfeedController.postNewsFeed);
    router.post('/newsfeed/like', _AuthCheck, newsfeedController.likePost);
    router.post('/newsfeed/comment', _AuthCheck, newsfeedController.commentPost);
    router.get('/newsfeed/myposting', _AuthCheck, newsfeedController.getNewsFeedCreatedByMe);
}