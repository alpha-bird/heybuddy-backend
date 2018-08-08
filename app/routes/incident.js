const incidentController = require('../controllers/incident.controller'),
      restemplateController = require('../controllers/restemplate.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/incident/create', _AuthCheck, incidentController.createIncident);
    router.post('/incident/close', _AuthCheck, incidentController.closeIncident);
    router.get('/incident/all',  _AuthCheck, incidentController.getAll);
    router.post('/incident/response', _AuthCheck, incidentController.getResponses);
    router.post('/incident/comment', _AuthCheck, incidentController.getComments);
    router.post('/incident/response/save', _AuthCheck, incidentController.saveResponse);
    router.post('/incident/comment/save', _AuthCheck, incidentController.saveComment);
    router.post('/incident/media/upload', _AuthCheck, incidentController.uploadMedia);
    router.post('/incident/response/templates', _AuthCheck, restemplateController.getall);
    router.post('/incident/response/templates/create', _AuthCheck, restemplateController.saveOne);
}