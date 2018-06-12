const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Incident = require('../models/incident'),
      moment = require('moment');

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
    }),

    closeIncident : wrapper(function*( req, res ) {
        var incidentId = req.body.incidentId;

        _Incident.findOne( { incidentId : incidentId }, wrapper(function*(err, incident) {
            incident.updateField('status', 'closed')
            yield incident.saveToDataBase()
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
        res.send({ success : true, data : status })
    })
}

module.exports = incidentModule;