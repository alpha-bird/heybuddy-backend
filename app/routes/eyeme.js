const eyemeController = require('../controllers/eyeme.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/eyeme/create', _AuthCheck, eyemeController.create);
}