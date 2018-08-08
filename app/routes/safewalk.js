const safewalkController = require('../controllers/safewalk.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/safewalk/create', _AuthCheck, safewalkController.create);
}