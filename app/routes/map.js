const mapController = require('../controllers/map.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.get('/map/homeaddress', _AuthCheck, mapController.getHomeAddress);
    router.get('/map/activemeetups', _AuthCheck, mapController.getActiveMeetups);
    router.get('/map/recentlocations',  _AuthCheck, mapController.getRecentLocations);
    router.get('/map/favoritelocations', _AuthCheck, mapController.getFavoriteLocations);
    router.post('/map/favoritelocations/save', _AuthCheck, mapController.saveFavoriteLocations);
    router.post('/map/suggestion/save', _AuthCheck, mapController.sendSuggestion);
}