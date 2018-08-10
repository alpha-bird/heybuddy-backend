const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _FakeCall = require('../models/fakecall');

const fakecallModule = {
    create : wrapper(function*( req, res ) {
        var newFakecall = new _FakeCall({
            createdTime : moment(Date.now()).utc().format(),
            createdBy : req.session.user._id
        })
        yield newFakecall.saveToDataBase()
        res.send({ success : true })
    })
}

module.exports = fakecallModule;