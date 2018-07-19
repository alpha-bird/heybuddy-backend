const timerController = require('../controllers/timer.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/timer/new', timerController.createTimer);
    router.post('/timer/update', timerController.updateTimer);
    router.post('/timer/complete', timerController.completeTimer);
    router.get('/timer/mine', timerController.getTimersByMe);
    router.get('/timer/all', timerController.getTimers);
}