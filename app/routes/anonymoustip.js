const anonymoustipController = require('../controllers/anonymoustip.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/anonymoustip/create', _AuthCheck, anonymoustipController.createAnonymousTip);
    router.get('/anonymoustip/mine', _AuthCheck, anonymoustipController.getAnonymousTipsByMe);
    router.get('/anonymoustip/public', _AuthCheck, anonymoustipController.getPublicAnonymousTips);
    router.get('/anonymoustips', _AuthCheck, anonymoustipController.getAllAnonymousTips);
    router.post('/anonymoustip/filter/category', _AuthCheck, anonymoustipController.getAnonymousTipsByCategory);
    router.post('/anonymoustip/filter/timeofday', _AuthCheck, anonymoustipController.getAnonymousTipsByTimeOfDay);
}