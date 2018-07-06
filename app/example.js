const moment = require('moment')
var today = moment().utc().hours(0);
var lastweek = moment().utc().subtract(7,'days').hours(0);
var lastmonth = moment().utc().subtract(30,'days').hours(0);
console.log(today.format())
console.log(lastweek.format())
console.log(lastmonth.format())