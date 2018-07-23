const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _ResponseTemplate = require('../models/restemplate');

const responseModule = {
    getall : wrapper(function*( req, res ) {
        var resTemplates = yield _ResponseTemplate.getAllTemplates()
        res.send({
            success : true,
            responses : resTemplates
        })
    }),
    saveOne : wrapper(function*( req, res ) {
        var newtemplate = new _ResponseTemplate( req.body.newresponse )
        yield newtemplate.saveToDataBase()
        res.send({
            success : true,
            newtemplate : newtemplate
        })
    })
}

module.exports = responseModule;