const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Meetup = require('../models/meetup');

const meetupModule = {
    /*
    accessToken,
    title,
    description,
    createdTime,
    ispublic,
    members,
    memberLength,
    pollResult : {
        agreedMembers,
        disagreedMembers,
        notVotedMembers,
        percentageOfAgree,
        percentageOfDisagree,
        percentageOfNotVoted
    }
    */
    createMeetUp : wrapper(function*( req, res ) {
        var body = req.body
        var newMeetUp = new _Meetup(body.meetInfo)
        newMeetUp.updateField('organizer', req.session.user._id)
        yield newMeetUp.saveToDataBase()
    })
}

module.exports = meetupModule;