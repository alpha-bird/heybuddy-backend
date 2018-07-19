const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      cronjob = require('cron').CronJob,
      _Timer = require('../models/timer'),
      _Session = require('../models/session'),
      _PushNotification = require('../lib/pushnotification');

// by minutes
function getTimeLeft( estimationTime ) {
    var timeNow = moment(Date.now()).utc()
    var momentEstimation = new moment(estimationTime)
    var left = momentEstimation.diff(timeNow)/60000
    return left
}

function sendPushnotification( tokenIds, contents, headings ) {
    return new Promise( (resolve ,reject) => {
        var data = {
            contents: { 'en' : contents },
            headings: { 'en' : headings },
            ios_badgeType : 'Increase',
            ios_badgeCount : 1,
            include_player_ids : tokenIds
        }
        _PushNotification.sendPush( data ).then( errors => {
            if( errors ) {
                console.log('Sending push notification failed!', pushRes.errors)
                resolve(false)
            }
            else {
                console.log('Sending push notification successed!')
                resolve(true)
            }
        })
    })
}

const timerModule = {
    createTimer : wrapper(function*( req, res ) {
        var user = req.session.user

        var duration = req.body.duration
        var timeNow = Date.now()
        var _createdTime = moment(timeNow).utc().format()
        var _estimationTime = moment(timeNow).add( duration, 'minutes').utc().format()

        var cronTime = new Date(_estimationTime.format('YYYY'), _estimationTime.format('M'), _estimationTime.format('D'), _estimationTime.format('H'), _estimationTime.format('m'), _estimationTime.format('s'), 0)
        var userPushtoken = yield _Session.getPushTokenByUserID( user._id );

        var job = new cronjob(cronTime, wrapper(function*() {
                console.log('Cron job working ....')

                if( userPushtoken !== '' ) {
                    console.log("Sending push notification for timer completion ... ");
                    yield sendPushnotification( [userPushtoken], 
                        `${user.profile.firstName}, Complete your timer by confirmming your pin code!!`,
                        'Complete your Timer!!' )
                }
                /*
                * Runs every weekday (Monday through Friday)
                * at 11:30:00 AM. It does not run on Saturday
                * or Sunday.
                */
            }), function () {
                console.log('Timer cron stopped!')
                /* This function is executed when the job stops */
            },
            true, /* Start the job right now */
            'UTC' /* Time zone of this job. */
        );
        var timerBody = {
            details : req.body.details,
            createdTime : _createdTime,
            estimationOfCompletionTime : _estimationTime,
            duration : duration,
            createdBy : user._id,
            cronJob : job,
            viewers : req.body.viewers,
            status : 'open'
        }
        
        var newTimer = new _Timer(timerBody)
        yield newTimer.saveToDataBase()

        if( userPushtoken !== '' ) yield sendPushnotification( [ userPushtoken ], `${user.profile.firstName}, You just started your timer!!`, 'Timer started!')

        var tokenIds = [];
        for( var i = 0; i < timerBody.viewers.length; i ++ ) {
            var viewerToken = yield _Session.getPushTokenByUserID( timerBody.viewers[i] );
            if ( viewerToken !== '' ) {
                tokenIds.push(viewerToken)
            }
        }
        yield sendPushnotification(tokenIds, `${user.profile.firstName} just started new timer!!`, 'New Timer started!')

        res.send({ success : true, timer : newTimer })
    }),
    
    completeTimer : wrapper(function*(req, res) {
        var user = req.session.user
        if( req.body.pinCode === user.pin ) {
            var timer = yield _Timer.findOneById(req.body.timerId)
            timer.updateField('status','completed')
            yield timer.saveToDataBase()

            var tokenIds = []
            for( var i = 0; i < timer.viewers.length ; i ++) {
                var viewerToken = yield _Session.getPushTokenByUserID( timer.viewers[i] );
                if ( viewerToken !== '' ) {
                    tokenIds.push(viewerToken)       
                }
            }
            yield sendPushnotification( tokenIds, `${user.profile.firstName} ended a timer!! Thanks for being a buddy they are safe!`, 'Timer ended!')

            return res.send({ success : true, reason : '' })
        }
        else {
            return res.send({ success : false, reason : 'Pincode is incorrect!!' })
        }
    }),

    getTimers : wrapper(function*(req, res) {
        var timers = yield _Timer.findAll()

        for( var i = 0 ; i < timers.length; i ++ ) {
            if ( timers[i].status === 'open' ) timers[i].timeLeft = getTimeLeft(timers[i].estimationOfCompletionTime)
            else timers[i].timeLeft = 0
        }
        
        return res.send({ success : true, timers : timers })
    }),

    getTimersByMe : wrapper(function*(req, res) {
        var user = req.session.user
        var timers = yield _Timer.findTimersByCreater( user._id )
        
        for( var i = 0 ; i < timers.length; i ++ ) {
            if ( timers[i].status === 'open' ) timers[i].timeLeft = getTimeLeft(timers[i].estimationOfCompletionTime)
            else timers[i].timeLeft = 0
        }

        return res.send({ success : true, timers : timers })
    }),

    updateTimer : wrapper(function*(req, res) {
        var user = req.session.user
        var timerId = req.body.timerId
        var addtionalDuration = req.body.addition

        var timer = yield _Timer.findOneById( timerId )
        
        var neweduration = addtionalDuration + timer.duration
        var newEsitmationCompletionTime = moment(timer.estimationOfCompletionTime).add(addtionalDuration, 'minutes')

        timer.cronJob.stop()
        var cronTime = new Date(newEsitmationCompletionTime.format('YYYY'), newEsitmationCompletionTime.format('M'), newEsitmationCompletionTime.format('D'), newEsitmationCompletionTime.format('H'), newEsitmationCompletionTime.format('m'), newEsitmationCompletionTime.format('s'), 0)
        var userPushtoken = yield _Session.getPushTokenByUserID( user._id );
        var job = new cronjob(cronTime, wrapper(function*() {
                console.log('Cron job working ....')

                if( userPushtoken !== '' ) {
                    console.log("Sending push notification for timer completion ... ");
                    yield sendPushnotification( [ userPushtoken ], `${user.profile.firstName}, Complete your timer by confirmming your pin code!!`, 'Complete your Timer!!')
                }
                /*
                * Runs every weekday (Monday through Friday)
                * at 11:30:00 AM. It does not run on Saturday
                * or Sunday.
                */
            }), function () {
                console.log('Timer cron stopped!')
                /* This function is executed when the job stops */
            },
            true, /* Start the job right now */
            'UTC' /* Time zone of this job. */
        );

        timer.updateField('duration', neweduration)
        timer.updateField('estimationOfCompletionTime', newEsitmationCompletionTime.format())
        timer.updateField('cronJob', job)

        yield timer.saveToDataBase()

        if( userPushtoken !== '' ) yield sendPushnotification( [ userPushtoken ], `${user.profile.firstName}, You just updated your timer!!`, 'Your Timer updated!')

        var tokenIds = [];
        for( var i = 0; i < timerBody.viewers.length; i ++ ) {
            var viewerToken = yield _Session.getPushTokenByUserID( timerBody.viewers[i] );
            if ( viewerToken !== '' ) {
                tokenIds.push(viewerToken)
            }
        }
        yield sendPushnotification( tokenIds, `${user.profile.firstName} just updated timer!!`, 'Timer updated!')
        
        return res.send({ success : true, timer : timer })
    })
}

module.exports = timerModule;