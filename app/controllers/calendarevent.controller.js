const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _CalendarEvent = require('../models/calendarevent');

const calendarEventModule = {
    getCalendarEvent : wrapper(function*( req, res ) {
        var user = req.session.user

        var eventlist = yield _CalendarEvent.getEventCreatedBySomeone(user._id)
        res.send({ success : true, eventlist : eventlist })
    }),
    addCalendarEvent : wrapper(function*(req, res) {
        var user = req.session.user
        var data = {
            title : req.body.title,
            description : req.body.description ? req.body.description : '',
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            createdTime : moment(Date.now()).utc().format(),
            createdBy : user._id,
            alarmTime : req.body.alarmTime
        }

        var eventObj = new _CalendarEvent(data)
        yield eventObj.saveToDataBase()
        res.send({ success : true, calendarEvent : eventObj })
    }),
    removeCalendarEvent : wrapper(function*(req, res) {
        var eventId = req.body.eventId
        var eventObj = yield _CalendarEvent.findOneById(eventId)
        yield eventObj.removeFromDataBase()
        res.send({ success : true })
    })
}

module.exports = calendarEventModule;