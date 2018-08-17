const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Meetup = require('../models/meetup'),
      _Suggestion = require('../models/suggestion')

const mapModule = {
    getHomeAddress : wrapper(function*(req, res) {
            var user = req.session.user
            res.send({
                success : true,
                homeAddress : user.profile.position
            })
        }),
    getActiveMeetups : wrapper(function*( req, res ) {
            var meetups = yield _Meetup.findAllPublic()
            res.send({
                success : true,
                meetups : meetups
            })
        }),
    getRecentLocations : wrapper(function*(req, res) {
            var user = req.session.user
            var locations = user.trackLocations
            
            var recentLocations = []

            if( locations.length === 1 ) recentLocations = [locations[0]]
            if( locations.length === 2 ) recentLocations = [locations[0], locations[1]]
            if( locations.length > 2 ) recentLocations = [locations[locations.length-3], locations[locations.length-2], locations[locations.length-1]]

            res.send({
                success : true,
                recentLocations : recentLocations
            })
        }),
    getFavoriteLocations : wrapper(function*(req, res) {
            var user = req.session.user
            res.send({
                success : true,
                favoriteLocations : user.favoriteLocations,
                count : user.favoriteLocations.length
            })
        }),
    saveFavoriteLocations : wrapper(function*(req, res) {
            var user = req.session.user
            var favoriteLocation = {
                description : req.body.description,
                position : req.body.position
            }
            user.favoriteLocations.push(favoriteLocation)
            yield user.saveToDataBase()
            
            res.send({
                success : true
            })
        }),
    sendSuggestion : wrapper(function*(req, res) {
            var user = req.session.user
            var newSuggestion = new _Suggestion({
                region : req.body.region,
                category : req.body.category,
                suggestion : req.body.suggestion,
                createdBy : user._id
            })
            yield newSuggestion.saveToDataBase()
            res.send({
                success : true,
                suggestion : newSuggestion
            })
        })
}

module.exports = mapModule;