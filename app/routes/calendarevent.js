const calendareventController = require('../controllers/calendarevent.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.get('/calendarevents', _AuthCheck, calendareventController.getCalendarEvent);
    router.post('/calendarevent/create', _AuthCheck, calendareventController.addCalendarEvent);
    router.post('/calendarevent/delete', _AuthCheck, calendareventController.removeCalendarEvent);
}