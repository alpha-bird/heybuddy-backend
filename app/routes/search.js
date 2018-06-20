const searchController = require('../controllers/search.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/search', searchController.searchAll);
}