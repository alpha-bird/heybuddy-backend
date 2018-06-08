const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _NewsFeed = require('../models/newsfeed');

const newsFeedModule = {
    postNewsFeed : wrapper(function*( req, res ) {
            var user = req.session.user
            var newsFeedBody = {
                createdTime : moment(Date.now()).utc().format(),
                createdBy : user._id,
                description : req.body.description,
                media : req.body.media
            }
            
            var newsFeed = new _NewsFeed(newsFeedBody)
            yield newsFeed.saveToDataBase()

            var updatedNewsFeedList = Object.assign([], user._doc.newsFeeds)
            updatedNewsFeedList.put(newsFeed._id)

            user.updateField('newsFeeds', updatedNewsFeedList)
            yield user.saveToDataBase()

            res.send({ success : true, newsFeed : newsFeed._doc })
        }),
    likePost : wrapper(function*( req, res ){
            var user = req.session.user
            var postId = req.body.newsFeedId
            var posting = yield _NewsFeed.findOneById( postId )
            var likeInfo = Object.assign({}, posting._doc.likes)
            likeInfo.likedBy.put(user._id)

            var updatedlikeInfo = {
                count : likeInfo.count + 1,
                likedBy : likeInfo.likedBy
            }
            
            posting.updateField('likes', updatedlikeInfo)
            yield posting.saveToDataBase()

            var updatedlikePostings = Object.assign([], user._doc.likePostings)
            updatedlikePostings.put(postId)
            user.updateField('likePostings', updatedlikePostings)
            yield user.saveToDataBase()

            res.send({ success : true })
        }),
    commentPost : wrapper(function*(req, res) {
            var user = req.session.user
            var postId = req.body.newsFeedId
            var posting = yield _NewsFeed.findOneById( postId )
            var commentInfo = Object.assign({}, posting._doc.comments)
            commentInfo.commentedBy.put(user._id)

            var updatedcommentInfo = {
                count : commentInfo.count + 1,
                commentedBy : commentInfo.commentedBy
            }
            
            posting.updateField('comments', updatedcommentInfo)
            yield posting.saveToDataBase()

            var updatedcommentedPostings = Object.assign([], user._doc.commentedPostings)
            updatedcommentedPostings.put(postId)
            user.updateField('commentedPostings', updatedcommentedPostings)
            yield user.saveToDataBase()

            res.send({ success : true })
        }),
    getNewsFeedCreatedByMe : wrapper(function*( req, res ) {
            var user = req.session.user
            var newsFeeds = yield _NewsFeed.findAllCreatedBySomeone( user._id )

            res.send({ success : true, list : newsFeeds })
        })
}

module.exports = newsFeedModule;