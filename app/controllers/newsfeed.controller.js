const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user'),
      _NewsFeed = require('../models/newsfeed');
      _Session = require('../models/session'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification');

function sendPushnotification( tokenIds, contents, headings ) {
    return new Promise( (resolve ,reject) => {
        var data = {
            contents: { 'en' : contents },
            headings: { 'en' : headings },
            ios_badgeType : 'Increase',
            ios_badgeCount : 1,
            include_player_ids : tokenIds
        }
        _PushNotification.sendPush( data ).then( errors => {
            if( errors ) {
                console.log('Sending push notification failed!', pushRes.errors)
                resolve(false)
            }
            else {
                console.log('Sending push notification successed!')
                resolve(true)
            }
        })
    })
}

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
                    datetime : moment(Date.now()).utc().format(),
                    image : ''
                })
                yield notification.saveToDataBase()

                if ( viewerToken !== '' ) {
                    tokenIds.push(viewerToken)
                }
            }
            if( tokenIds.length !== 0 ) yield sendPushnotification(tokenIds, `${user.profile.firstName} just posted new Newsfeed!!`, 'Newsfeed posted!')
            res.send({ success : true, newsFeed : newsFeed })
        }),
    likePost : wrapper(function*( req, res ){
            var user = req.session.user
            var postId = req.body.newsFeedId
            var posting = yield _NewsFeed.findOneById( postId )
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

            var posterToken = yield _Session.getPushTokenByUserID( posting.createdBy )
            if ( posterToken !== '' ) yield sendPushnotification([ posterToken ], `${user.profile.firstName} like your post!`, 'Like post!')

            var owner = yield _User.findOneById(posting.createdBy)
            var notification = yield _Notification.findOneById(owner.notificationId)
            notification.putNotification({
                title : 'Like post!',
                description : `${user.profile.firstName} like your post!`,
                datetime : moment(Date.now()).utc().format(),
                image : ''
            })
            yield notification.saveToDataBase()

            res.send({ success : true })
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

            var posterToken = yield _Session.getPushTokenByUserID( posting.createdBy );
            if ( posterToken !== '' ) yield sendPushnotification([ posterToken ], `${user.profile.firstName} made comment on your post!`, 'Comment post!')
            
            var owner = yield _User.findOneById(posting.createdBy)
            var notification = yield _Notification.findOneById(owner.notificationId)
            notification.putNotification({
                title : 'Comment post!',
                description : `${user.profile.firstName} made comment on your post!`,
                datetime : moment(Date.now()).utc().format(),
                image : ''
            })
            yield notification.saveToDataBase()

            res.send({ success : true })
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
                for( var j = 0; j < newsFeeds[i].comments.commentedBy.length ; j ++ ) {
                    newsFeeds[i].comments.commentedBy[j] = yield _User.findOneById(newsFeeds[i].comments.commentedBy[j])
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