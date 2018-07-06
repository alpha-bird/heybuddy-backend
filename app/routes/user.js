const userController = require('../controllers/user.controller'),
      utilities = require('../lib/utilities'),
      passport = require('passport'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post( '/user/login', userController.login );
    router.post( '/user/login/facebook', userController.loginWithFacebook);
    router.post( '/user/login/google', userController.loginWithGoogle);
    //router.post( '/user/login/twitter', userController.loginWithTwitter);
    router.post( '/user/auth/twitter/reverse', userController.reverseTwitter);
    router.post( '/user/auth/twitter', userController.authTwitter, 
        passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
            if (!req.user) {
                return res.send(401, 'User Not Authenticated');
            }

            // prepare token for API
            req.auth = req.user.email;
            return next();
        },
        userController.generateToken,
        userController.sendToken
    );
    router.post( '/user/sendcode', userController.sendCode);
    router.post( '/user/changepassword', userController.changePassword);
    router.post( '/user/signup', userController.signUp );
    router.post( '/user/setavailability', userController.setAvailability);
    router.post( '/user/setcompanies', _AuthCheck, userController.setCompanies);
    router.post( '/user/profile', _AuthCheck, userController.getProfile );
    router.post( '/user/media/upload', userController.uploadMedia );
    router.post( '/user/specific', _AuthCheck, userController.getUserProfileById);
}