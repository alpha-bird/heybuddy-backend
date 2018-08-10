const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _SafeWalk = require('../models/safewalk');

const safewalkModule = {
    create : wrapper(function*( req, res ) {
        var newSafewalk = new _SafeWalk({
            createdTime : moment(Date.now()).utc().format(),
            createdBy : req.session.user._id
        })
        yield newSafewalk.saveToDataBase()
        res.send({ success : true })
    })
}

module.exports = safewalkModule;