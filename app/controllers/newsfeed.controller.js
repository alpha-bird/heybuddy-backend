const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user'),
      _NewsFeed = require('../models/newsfeed');
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification');

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
            
            var updatedNewsFeedList = Object.assign([], user.newsFeeds)
            updatedNewsFeedList.push(newsFeed._id)

            user.updateField('newsFeeds', updatedNewsFeedList)
            yield user.saveToDataBase()

            var tokenIds = [];
            for( var i = 0; i < user.buddies.length; i ++ ) {
                var viewerToken = yield _Session.getPushTokenByUserID( user.buddies[i] );

                var buddy = yield _User.findOneById(user.buddies[i])
                var notification = yield _Notification.findOneById(buddy.notificationId)
                notification.putNotification({
                    title : 'Newsfeed posted!',
                    description : `${user.profile.firstName} just posted new Newsfeed!!`,
                    image : '',
                    timestamp : moment(Date.now()).utc().format(),
                    isread : false
                })
                yield notification.saveToDataBase()

                if ( viewerToken !== '' ) {
                    tokenIds.push(viewerToken)
                }
            }
            if( tokenIds.length !== 0 ) yield _PushNotification.send(tokenIds, `${user.profile.firstName} just posted new Newsfeed!!`, 'Newsfeed posted!')
            res.send({ success : true, newsFeed : newsFeed })
        }),
    likePost : wrapper(function*( req, res ){
            var user = req.session.user
            var postId = req.body.newsFeedId
            var posting = yield _NewsFeed.findOneById( postId )

            if ( posting.likes.includes(user._id) ) {
                var likeInfo = Object.assign({}, posting.likes)
                likeInfo.likedBy.push(user._id)

                var updatedlikeInfo = {
                    count : likeInfo.count + 1,
                    likedBy : likeInfo.likedBy
                }
                
                posting.updateField('likes', updatedlikeInfo)
                yield posting.saveToDataBase()

                var updatedlikePostings = Object.assign([], user.likePostings)
                updatedlikePostings.push(postId)
                user.updateField('likePostings', updatedlikePostings)
                yield user.saveToDataBase()

                var owner = yield _User.findOneById(posting.createdBy)
                var notification = yield _Notification.findOneById(owner.notificationId)
                notification.putNotification({
                    title : 'Like post!',
                    description : `${user.profile.firstName} like your post!`,
                    image : '',
                    timestamp : moment(Date.now()).utc().format(),
                    isread : false
                })
                yield notification.saveToDataBase()

                var posterToken = yield _Session.getPushTokenByUserID( posting.createdBy )
                if ( posterToken !== '' ) yield _PushNotification.send([ posterToken ], `${user.profile.firstName} like your post!`, 'Like post!')

                res.send({ success : true })
            }
            else {
                res.send({ success : false, reason : 'Already liked!' })
            }
        }),
    commentPost : wrapper(function*(req, res) {
            var user = req.session.user
            var postId = req.body.newsFeedId
            var content = req.body.content

            var posting = yield _NewsFeed.findOneById( postId )
            posting.comments.push({
                commentedBy : user._id,
                content : content
            })
            yield posting.saveToDataBase()

            user.commentedPostings.push(postId)
            yield user.saveToDataBase()
            
            var owner = yield _User.findOneById(posting.createdBy)
            var notification = yield _Notification.findOneById(owner.notificationId)
            notification.putNotification({
                title : 'Comment post!',
                description : `${user.profile.firstName} made comment on your post!`,
                image : '',
                timestamp : moment(Date.now()).utc().format(),
                isread : false
            })
            yield notification.saveToDataBase()

            var posterToken = yield _Session.getPushTokenByUserID( posting.createdBy );
            if ( posterToken !== '' ) yield sendPushnotification([ posterToken ], `${user.profile.firstName} made comment on your post!`, 'Comment post!')

            res.send({ success : true })
        }),
    getComments : wrapper(function*(req, res) {
            var postId = req.body.newsFeedId
            var posting = yield _NewsFeed.findOneById( postId )

            for( var i = 0; i < posting.comments.length ; i ++ ) {
                posting.comments[i].commentedBy = yield _User.findOneById(posting.comments[i].commentedBy)
            }
            res.send({ success : true, comments : posting.comments })
        }),
    getNewsFeedCreatedByMe : wrapper(function*( req, res ) {
            var user = req.session.user
            var newsFeeds = yield _NewsFeed.findAllCreatedBySomeone( user._id )

            res.send({ success : true, list : newsFeeds })
        }),
    getAllNewsFeed : wrapper(function*(req, res) {
            var newsFeeds = yield _NewsFeed.findAll()
            for( var i = 0 ; i < newsFeeds.length; i ++ ) {
                newsFeeds[i].createdBy = yield _User.findOneById(newsFeeds[i].createdBy)
                for( var j = 0; j < newsFeeds[i].likes.likedBy.length ; j ++ ) {
                    newsFeeds[i].likes.likedBy[j] = yield _User.findOneById(newsFeeds[i].likes.likedBy[j])
                }
                for( var j = 0; j < newsFeeds[i].comments.length ; j ++ ) {
                    newsFeeds[i].comments[j].commentedBy = yield _User.findOneById(newsFeeds[i].comments[j].commentedBy)
                }
            }
            res.send({ success : true, newfeed : newsFeeds })
        }),
    uploadMedia : wrapper(function*(req, res) {
            var newsfeed_media_bucket = 'newsfeed-media';
            var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
            var data = req.body.content;
            var params = { 
                Bucket: newsfeed_media_bucket, 
                Key: key, 
                Body: data,
                ACL : 'public-read'
            };
            var upload = ( params ) => {
                return new Promise((resolve, reject) => {
                    S3.putObject(params, (err, data) => {
                        if(err) reject(err)
                        else resolve(data)
                    })
                })
            }

            var status = yield upload(params)
            res.send({ success : true, data : status })
        })
}

module.exports = newsFeedModule;