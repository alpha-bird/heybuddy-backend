const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _EyeMe = require('../models/eyeme'),

const eyemeModule = {
    create : wrapper(function*( req, res ) {
        var newEyeme = new _EyeMe({
            createdTime : moment(Date.now()).utc().format(),
            createdBy : req.session.user._id
        })
        yield newEyeme.saveToDataBase()
        res.send({ success : true })
    })
}

module.exports = eyemeModule;