const newsfeedController = require('../controllers/newsfeed.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/newsfeed/post', _AuthCheck, newsfeedController.postNewsFeed);
    router.post('/newsfeed/like', _AuthCheck, newsfeedController.likePost);
    router.post('/newsfeed/comment', _AuthCheck, newsfeedController.commentPost);
    router.post('/newsfeed/specific/comment', _AuthCheck, newsfeedController.getComments);
    router.get('/newsfeed/myposting', _AuthCheck, newsfeedController.getNewsFeedCreatedByMe);
    router.get('/newsfeed', _AuthCheck, newsfeedController.getAllNewsFeed);
    router.post('/newsfeed/media/upload', _AuthCheck, newsfeedController.uploadMedia);
}