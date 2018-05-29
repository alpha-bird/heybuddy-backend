const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Incident = require('../models/incident');

const incidentModule = {
    createIncident : wrapper(function*( req, res ) {
        var user = req.session.user;
        var incidentbody = {
            incidentId : req.body.incident.id,
            status : 'open',
            createdTime : Date.now(),
            description : req.body.incident.description,
            geo : req.body.incident.geo,
            reporter : {
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
    })
}

module.exports = incidentModule;