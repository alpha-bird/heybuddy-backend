const incidentController = require('../controllers/incident.controller'),
      emergencyController = require('../controllers/emergency.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/emergency/occur', _AuthCheck, emergencyController.emergencyOccur);
    router.post('/emergency/media/update', _AuthCheck, emergencyController.updateMediasEmergency);
    router.post('/emergency/close', _AuthCheck, incidentController.closeIncident);
    router.post('/emergency/response', _AuthCheck, incidentController.getResponses);
    router.post('/emergency/comment', _AuthCheck, incidentController.getComments);
    router.post('/emergency/response/save', _AuthCheck, incidentController.saveResponse);
    router.post('/emergency/comment/save', _AuthCheck, incidentController.saveComment);
    router.post('/emergency/media/upload', _AuthCheck, incidentController.uploadMedia);
}