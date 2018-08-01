const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Notification = require('../models/notification'),
      _Chat = require('../models/chat'),
      _Company = require('../models/company'),
      _Incident = require('../models/incident'),
      _Meetup = require('../models/meetup'),
      _NewsFeed = require('../models/newsfeed'),
      _User = require('../models/user');

const notificationModule = {
    getMyNotifications : wrapper(function*( req, res ) {
        var user = req.session.user
        var fullNotification = yield _Notification.findOneById(user.notificationId)
        res.send({
            success : true,
            notification : fullNotification
        })
    }),
    readNotification : wrapper(function*(req, res) {
        var user = req.session.user
        var notificationIndex = req.body.notificationIndex
        var fullNotification = yield _Notification.findOneById(user.notificationId)
        fullNotification.oldnotifications.push(fullNotification.newnotifications[notificationIndex])
        fullNotification.newnotifications.splice(notificationIndex, 1)
        yield fullNotification.saveToDataBase()
        res.send({ success : true })
    })
}

module.exports = notificationModule;