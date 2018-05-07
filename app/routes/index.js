const express = require('express'),
    router = express.Router(),
    userRouter = require('./user'),
    buddyRouter = require('./buddy'),
    companyRouter = require('./company')
    chatRouter = require('./chat'),
//export router
module.exports = router;

userRouter(router);
buddyRouter(router);
companyRouter(router);
chatRouter(router);