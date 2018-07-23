const settingsController = require('../controllers/settings.controller'),
    _AuthCheck = require('../auth');

module.exports = ( router ) => {
      router.post('/settings/update', _AuthCheck, settingsController.updateSettings);
}