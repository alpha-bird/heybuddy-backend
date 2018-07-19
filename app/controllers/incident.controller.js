const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Incident = require('../models/incident'),
      AWS = require('aws-sdk'),
      S3 = new AWS.S3(),
      moment = require('moment'),
      _Session = require('../models/session'),
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

const incidentModule = {
    createIncident : wrapper(function*( req, res ) {
        var user = req.session.user;
        var incidentbody = {
            incidentId : req.body.incident.id,
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

        var tokenIds = [];
        for( var i = 0; i < user.buddies.length; i ++ ) {
            var buddyToken = yield _Session.getPushTokenByUserID( user.buddies[i] );
            if ( buddyToken !== '' ) {
                tokenIds.push(buddyToken)
            }
        }
        yield sendPushnotification(tokenIds, `${user.profile.firstName} just created new Incident!!`, 'Incident happened!')
        
        res.send({ success : true })
    }),

    closeIncident : wrapper(function*( req, res ) {
        var incidentId = req.body.incidentId;

        _Incident.findOne( { incidentId : incidentId }, wrapper(function*(err, incident) {
            incident.updateField('status', 'closed')
            yield incident.saveToDataBase()
            res.send( { success : true })
        }))
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
    })
}

module.exports = incidentModule;