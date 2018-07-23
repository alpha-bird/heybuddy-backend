const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      AWS = require('aws-sdk'),
      S3 = new AWS.S3(),
      _User = require('../models/user');

const settingsModule = {
    updateSettings : wrapper(function*(req, res) {
        var user = req.session.user
        var updatedSettings = req.body.settings
        user.updateField('settings', updatedSettings)
        yield user.saveToDataBase()
        res.send({
            success : true,
            user : user
        })
    })
}

module.exports = settingsModule;