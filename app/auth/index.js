const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user')

module.exports = wrapper(function*(req, res, next) {
    var token = req.headers["access-token"];
    
    if ( !token ) {
        res.send({
            success : false,
            message : 'AccessToken is invalid! Are you logged in?'
        });
    }
    else {
        var decoded = yield utilities.tokenAuthenticate(token);
        var user = yield _User.findOneByEmail(decoded.data);
        if ( user ) {
            req.session.user = user;
            next();
        }
        else {
            res.send({
                success : false,
                message : 'User not exist!'
            });
        }
    }
})