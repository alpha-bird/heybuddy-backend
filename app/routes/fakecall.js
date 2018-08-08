const fakecallController = require('../controllers/fakecall.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/fakecall/create', _AuthCheck, fakecallController.create);
}