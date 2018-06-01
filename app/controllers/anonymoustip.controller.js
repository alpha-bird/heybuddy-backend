const _AnonymousTip = require('../models/anonymoustip'),
      _User = require('../models/user'),
      wrapper = require('co-express'),
      utilities = require('../lib/utilities');

const anonymoustipModule = {
    createAnonymousTip : wrapper(function*(req, res) {
        var data = req.body
        data.created_by = req.session.user._id
        var newAnonymousTip = new _AnonymousTip(data)
        yield newAnonymousTip.saveToDataBase()
        res.send({ success : true })
    }),

    getAnonymousTipsByMe : wrapper(function*( req, res ) {
        var user = req.session.user
        var tipsCreatedByMe = yield _AnonymousTip.findAllByUserID(user._id)
        res.send({ success : true, tips : tipsCreatedByMe })
    }),

    getPublicAnonymousTips : wrapper(function*( req, res ) {
        var user = req.session.user
        var tipsPublic = yield _AnonymousTip.findAllPublic()
        res.send({ success : true, tips : tipsPublic })
    }),

    getAllAnonymousTips : wrapper(function*( req, res ) {
        var tips = yield _AnonymousTip.findAll()
        res.send({ success : true, tips : tips })
    }),

    getAnonymousTipsByCategory : wrapper(function*(req, res) { 
        var category = req.body.category
        var tips = yield _AnonymousTip.findByCategory(category)
        res.send({ success : true, tips : tips })
    }),

    getAnonymousTipsByTimeOfDay :  wrapper(function*(req, res) {
        var timeofday = req.body.timeofday
        var tips = []
        res.send({ success : true, tips : tips })
    })
}

module.exports = anonymoustipModule;