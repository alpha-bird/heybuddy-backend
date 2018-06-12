const incidentController = require('../controllers/incident.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/incident/create', _AuthCheck, incidentController.createIncident);
    router.post('/incident/close', _AuthCheck, incidentController.closeIncident);
    router.get('/incident/all',  _AuthCheck, incidentController.getAll);
    router.post('/incident/media/upload', _AuthCheck, incidentController.uploadMedia);
}