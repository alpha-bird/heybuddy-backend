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

const incidentModule = {
    createIncident : wrapper(function*( req, res ) {
        var user = req.session.user;
        var incidentbody = {
            status : 'open',
            createdTime : moment(Date.now()).utc().format(),
            description : req.body.incident.description,
            geo : req.body.incident.geo,
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
        for( var i = 0; i < user.buddies.length; i ++ ) {
            var buddyToken = yield _Session.getPushTokenByUserID( user.buddies[i] )

            var buddy = yield _User.findOneById(user.buddies[i])
            var notification = yield _Notification.findOneById(buddy.notificationId)
            notification.putNotification({
                title : 'Incident happened!',
                description : `${user.profile.firstName} just created new Incident!!`,
                image : '',
                timestamp : moment(Date.now()).utc().format(),
                isread : false
            })
            yield notification.saveToDataBase()
            
            if ( buddyToken !== '' ) {
                tokenIds.push(buddyToken)
            }
        }
        if( tokenIds.length !== 0 ) yield _PushNotification.send(tokenIds, `${user.profile.firstName} just created new Incident!!`, 'Incident happened!')
        
        res.send({ success : true })
    }),

    closeIncident : wrapper(function*( req, res ) {
        var incidentId = req.body.incidentId;
        var incident = yield _Incident.findOneById(incidentId)
        incident.status = 'closed'
        yield incident.saveToDataBase()
        res.send( { success : true })
    }),

    getAll : wrapper(function*( req, res ) {
        var incidents = yield _Incident.getAllIncidents();

        return res.send({
            data : incidents,
            length : incidents.length
        })
    }),

    uploadMedia : wrapper(function*(req, res) {
        var incident_media_bucket = 'incident-media';
        var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
        var data = req.body.content;
        var params = { 
            Bucket: incident_media_bucket, 
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
        var url = `https://s3.amazonaws.com/${incident_media_bucket}/${key}`
        res.send({ success : true, data : status, url : url })
    }),
    
    saveResponse : wrapper(function*(req, res) {
        var incidentId = req.body.incidentId
        var newResponse = req.body.response
        var incident = yield _Incident.findOneById(incidentId)
        incident.responses.push(newResponse)
        yield incident.saveToDataBase()
        res.send({
            success : true,
            comments : newResponses
        })
    }),
    
    getResponses : wrapper(function*(req, res) {
        var incidentId = req.body.incidentId
        var incident = yield _Incident.findOneById(incidentId)
        res.send({
            success : true,
            responses : incident.responses
        })
    }),

    saveComment : wrapper(function*(req, res) {
        var incidentId = req.body.incidentId
        var newComment = req.body.comment
        
        var incident = yield _Incident.findOneById(incidentId)
        incident.comments.push(newComment)
        yield incident.saveToDataBase()
        res.send({
            success : true,
            comments : newComments
        })
    }),

    getComments : wrapper(function*(req, res) {
        var incidentId = req.body.incidentId
        var incident = yield _Incident.findOneById(incidentId)
        res.send({
            success : true,
            comments : incident.comments
        })
    })
}

module.exports = incidentModule;