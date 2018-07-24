const buddyController = require('../controllers/buddy.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/buddy/searchbuddiesbyname', _AuthCheck, buddyController.searchBuddiesByName);
    router.get('/buddy/buddies', _AuthCheck ,buddyController.getAllBuddies);
    router.post('/buddy/buddyavailability', _AuthCheck, buddyController.getBuddyAvailability);
    router.get('/buddy/mybuddies', _AuthCheck, buddyController.getBuddies);
    router.get('/buddy/buddyreq', _AuthCheck, buddyController.getBuddyRequests);
    router.get('/buddy/buddypending', _AuthCheck, buddyController.getBuddyPendings);
    router.post('/buddy/sendinvite', _AuthCheck, buddyController.sendInvitation);
    router.post('/buddy/acceptinvite', _AuthCheck, buddyController.acceptInvitation);
    router.post('/buddy/declineinvite', _AuthCheck, buddyController.declineInvitation);
    router.post('/buddy/info', _AuthCheck, buddyController.getBuddyInfo);
}