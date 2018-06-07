const _AnonymousTip = require('../models/anonymoustip'),
      _User = require('../models/user'),
      wrapper = require('co-express'),
      utilities = require('../lib/utilities'),
      moment = require('moment');

const anonymoustipModule = {
    createAnonymousTip : wrapper(function*(req, res) {
        var data = req.body
        var user = req.session.user

        data.createdTime = moment(Date.now()).utc().format()
        data.createdBy = user._id
        var newAnonymousTip = new _AnonymousTip(data)
        yield newAnonymousTip.saveToDataBase()

        user.anonymousTips.put(newAnonymousTip._id)
        yield user.saveToDataBase()
        
        res.send({ success : true })
    }),

    getAnonymousTipsByMe : wrapper(function*( req, res ) {
        var user = req.session.user
        var tipsCreatedByMe = yield _AnonymousTip.findAllByUserID(user._id)
        res.send({ success : true, anonymoustips : tipsCreatedByMe })
    }),

    getPublicAnonymousTips : wrapper(function*( req, res ) {
        var user = req.session.user
        var tipsPublic = yield _AnonymousTip.findAllPublic()
        res.send({ success : true, anonymoustips : tipsPublic })
    }),

    getAllAnonymousTips : wrapper(function*( req, res ) {
        var tips = yield _AnonymousTip.findAll()
        res.send({ success : true, anonymoustips : tips })
    }),

    getAnonymousTipsByCategory : wrapper(function*(req, res) { 
        var category = req.body.category
        var tips = yield _AnonymousTip.findByCategory(category)
        res.send({ success : true, anonymoustips : tips })
    }),

    getAnonymousTipsByTimeOfDay :  wrapper(function*(req, res) {
        var timeofday = req.body.timeofday
        var tips = []
        res.send({ success : true, anonymoustips : tips })
    }),
//new
    getAnonymousTipLatest : wrapper(function*(req, res) {
        var tips = yield _AnonymousTip.findAll()
        var index = req.body.index ? req.body.index : 0

        var sortedTips = tips.sort(function(var1, var2) { 
            var a = moment(var1.createdTime), b = moment(var2.createdTime);
            if (a.isAfter(b))
                return 1;
            if (a.isBefore(b))
                return -1;
            return 0;
        })
        if ( sortedTips.length <= 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips, nextIndex : 0 })
        }
        if ( sortedTips.length - index > 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips.slice(index, index + 10), nextIndex : index + 10 })
        }
        if ( sortedTips.length - index <= 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips.slice(index, sortedTips.length - 1), nextIndex : 0 })
        }
    }),

    getAnonymousTipOldest : wrapper(function*(req, res) {
        var tips = yield _AnonymousTip.findAll()
        var index = req.body.index ? req.body.index : 0

        var sortedTips = tips.sort(function(var1, var2) { 
            var a = moment(var1.createdTime), b = moment(var2.createdTime);
            if (a.isBefore(b))
                return 1;
            if (a.isAfter(b))
                return -1;
            return 0;
        })
        if ( sortedTips.length <= 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips, nextIndex : 0 })
        }
        if ( sortedTips.length - index > 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips.slice(index, index + 10), nextIndex : index + 10 })
        }
        if ( sortedTips.length - index <= 10 ) {
            return res.send({ success : true, anonymoustips : sortedTips.slice(index, sortedTips.length - 1), nextIndex : 0 })
        }
    }),

    getAnonymousTipByYear : wrapper(function*(req, res) {
        var year = req.body.year
        var tips = yield _AnonymousTip.findAll()
        var filterdTips = []

        for(var i = 0; i < tips.length; i ++ ) {
            if( parseInt(moment(tips[i].createdTime).format('YYYY'))  === year ) {
                filterdTips.push(tips[i])
            }
        }
        res.send({ success : true, anonymoustips : filterdTips })
    })
}

module.exports = anonymoustipModule;