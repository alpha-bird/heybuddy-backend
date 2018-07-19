const moment = require('moment')
var today = moment().utc();
var oneHourplus = moment().utc().add(1, 'hours')
console.log(today)
console.log(oneHourplus)
console.log(oneHourplus.diff(today))
/*
var CronJob = require('cron').CronJob;
            var time = new Date()
            time.setTime(time.getTime() + 1000 * 60);
            console.log(time)
            var job = new CronJob(time, function() {
                    console.log('Cron job working')
                
                // Runs every weekday (Monday through Friday)
                // at 11:30:00 AM. It does not run on Saturday
                // or Sunday.
                }, function () {
                // This function is executed when the job stops 
                },
                true, // Start the job right now 
                'UTC' // Time zone of this job. 
            );
            */