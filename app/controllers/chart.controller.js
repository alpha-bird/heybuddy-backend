const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user'),
      _Meetup = require('../models/meetup'),
      _AnonymousTip = require('../models/anonymoustip'),
      _Incident = require('../models/incident')
      moment = require('moment');

const incidentModule = {
    getChartByLastweek : wrapper(function*(req, res) {
        var numberOfUser = yield _User.getNumberOfUserCreatedLastweek()
        var numberOfMeetup = yield _Meetup.getNumberOfMeetupCreatedLastweek()
        var numberOfAnonymousTip = yield _AnonymousTip.getNumberOfAnonymousTipCreatedLastweek()
        var numberOfTimer = 0
        var numberOfReport = yield _Incident.getNumberOfIncidentCreatedLastweek()
        res.send({
            user : numberOfUser,
            meetup : numberOfMeetup,
            anonymoustip : numberOfAnonymousTip,
            timer : numberOfTimer,
            incident : numberOfReport
        })
    }),
    getChartByLastmonth : wrapper(function*(req, res) {
        var numberOfUser = yield _User.getNumberOfUserCreatedLastmonth()
        var numberOfMeetup = yield _Meetup.getNumberOfMeetupCreatedLastmonth()
        var numberOfAnonymousTip = yield _AnonymousTip.getNumberOfAnonymousTipCreatedLastmonth()
        var numberOfTimer = 0
        var numberOfReport = yield _Incident.getNumberOfIncidentCreatedLastmonth()
        res.send({
            user : numberOfUser,
            meetup : numberOfMeetup,
            anonymoustip : numberOfAnonymousTip,
            timer : numberOfTimer,
            incident : numberOfReport
        })
    }),
    getChartByPickedDate : wrapper(function*(req, res) {
        var startDate = req.body.startDate
        var endDate = req.body.endDate
        var numberOfUser = yield _User.getNumberOfUserByDate(startDate, endDate)
        var numberOfMeetup = yield _Meetup.getNumberOfMeetupByDate(startDate, endDate)
        var numberOfAnonymousTip = yield _AnonymousTip.getNumberOfAnonymousTipByDate(startDate, endDate)
        var numberOfTimer = 0
        var numberOfReport = yield _Incident.getNumberOfIncidentByDate(startDate, endDate)
        res.send({
            user : numberOfUser,
            meetup : numberOfMeetup,
            anonymoustip : numberOfAnonymousTip,
            timer : numberOfTimer,
            incident : numberOfReport
        })
    }),
    getDataForBox1 : wrapper(function*(req, res) {
        var numberOfIncidentOpen = yield _Incident.getNumberOfIncidentOpen()
        var numberOfIncident = yield _Incident.getTotal()
        res.send({
            success : true,
            numberOfIncidentOpen : numberOfIncidentOpen,
            percentage : numberOfIncident !== 0 ? (numberOfIncidentOpen/numberOfIncident) * 100 : 0
        })
    }),
    getDataForBox2 : wrapper(function*(req, res) {
        var numberOfIncident = yield _Incident.getTotal()
        res.send({
            success : true,
            numberOfIncident : numberOfIncident
        })
    }),
    getDataForBox3 : wrapper(function*(req, res) {
        var numberOfIncidentClosed = yield _Incident.getNumberOfIncidentClosed()
        var numberOfIncident = yield _Incident.getTotal()
        res.send({
            success : true,
            numberOfIncidentClosed : numberOfIncidentClosed,
            percentage : numberOfIncident !== 0 ? (numberOfIncidentClosed/numberOfIncident) * 100 : 0
        })
    }),
    getDataForBox4 : wrapper(function*(req, res) {
        var redFeedback = 0 //rating < 2
        var yellowFeedbacck = 0 // rating <= 4
        var greenFeedback = 0 //rating > 4
        res.send({
            success : true,
            redFeedback : redFeedback,
            yellowFeedbacck : yellowFeedbacck,
            greenFeedback : greenFeedback
        })
    })
}

module.exports = incidentModule;