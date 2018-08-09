const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      AWS = require('aws-sdk'),
      S3 = new AWS.S3(),
      moment = require('moment'),
      _Session = require('../models/session'),
      _User = require('../models/user'),
      _Incident = require('../models/incident'),
      _Notification = require('../models/notification'),
      _PushNotification = require('../lib/pushnotification');

const emergencyModule = {
    emergencyOccur : wrapper(function*( req, res ) {
        var user = req.session.user;
        var incidentbody = {
            status : 'open',
            createdTime : moment(Date.now()).utc().format(),
            description : req.body.description,
            geo : req.body.geo,
            medias : req.body.medias,
            reporter : {
                reporterId : user._id,
                email : user.email,
                firstname : user.profile.firstName,
                lastname : user.profile.lastName
            }
        }
        
        var newIncident = new _Incident(incidentbody)
        yield newIncident.saveToDataBase()
        
        user.incidents.push(newIncident._id)
        yield user.saveToDataBase()
        
        var tokenIds = [];
        for( var i = 0; i < user.preSelectedContract.length; i ++ ) {
            var buddyToken = yield _Session.getPushTokenByUserID( user.preSelectedContract[i] )

            var buddy = yield _User.findOneById(user.preSelectedContract[i])
            var notification = yield _Notification.findOneById(buddy.notificationId)
            notification.putNotification({
                title : 'Will you help?',
                description : `Emergency occured on ${user.profile.firstName}'s side!, will you help him/her? \n ${user.settings.preWrittenMessage}`,
                image : '',
                timestamp : moment(Date.now()).utc().format(),
                isread : false
            })
            yield notification.saveToDataBase()
            
            if ( buddyToken !== '' ) {
                tokenIds.push(buddyToken)
            }
        }
        if( tokenIds.length !== 0 ) yield _PushNotification.send(tokenIds, `Emergency occured on ${user.profile.firstName}'s side!, will you help him/her? \n ${user.settings.preWrittenMessage}`, 'Will you help?')
        
        res.send({ success : true })
    }),
    updateMediasEmergency : wrapper(function*(req, res) {
        var incidentId = req.body.incidentId
        var incident = yield _Incident.findOneById(incidentId)
        incident.medias = req.body.medias
        yield incident.saveToDataBase()

        res.send({ success : true })
    })
}

module.exports = emergencyModule;