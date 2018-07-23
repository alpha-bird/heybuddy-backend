const responseTemplateController = require('../controllers/restemplate.controller'),
    _AuthCheck = require('../auth');

module.exports = ( router ) => {
      router.get('/response', _AuthCheck, responseTemplateController.getall);
      router.post('/response', _AuthCheck, responseTemplateController.saveOne);
}