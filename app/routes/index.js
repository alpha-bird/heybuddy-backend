const express = require('express'),
    router = express.Router(),
    userRouter = require('./user'),
    buddyRouter = require('./buddy'),
    companyRouter = require('./company')
    chatRouter = require('./chat'),
    incidentRouter = require('./incident'),
    anonymoustipRouter = require('./anonymoustip'),
    newsfeedRouter = require('./newsfeed'),
    meetupRouter = require('./meetup'),
    searchRouter = require('./search'),
    todoRouter = require('./todo'),
    charRouter = require('./chart'),
    calendareventRouter = require('./calendarevent'),
    feedbackRouter = require('./feedback'),
    messageRouter = require('./message'),
    notificationRouter = require('./notification'),
    responseTemplateRouter = require('./restemplate'),
    emergencyRouter = require('./emergency'),
    fakecallRouter = require('./fakecall'),
    safewalkRouter = require('./safewalk'),
    eyemeRouter = require('./eyeme');
    mapRouter = require('./map')
//export router
module.exports = router;

router.get('/', (req, res) => {
    res.render('pages/home');
})

userRouter(router)
buddyRouter(router)
companyRouter(router)
chatRouter(router)
incidentRouter(router)
anonymoustipRouter(router)
newsfeedRouter(router)
meetupRouter(router)
searchRouter(router)
todoRouter(router)
calendareventRouter(router)
charRouter(router)
feedbackRouter(router)
notificationRouter(router)
messageRouter(router)
responseTemplateRouter(router)
emergencyRouter(router)
fakecallRouter(router)
safewalkRouter(router)
eyemeRouter(router)
mapRouter(router)