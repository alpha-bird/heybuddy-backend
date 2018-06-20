const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _Meetup = require('../models/meetup');

const meetupModule = {
    createMeetUp : wrapper(function*( req, res ) {
        var meetupData = req.body.meetupInfo;
        var user = req.session.user;

        var data = {
            title : meetupData.title,
            description : meetupData.description,
            //location : {
                //latitude : 
                //longitude :
            //}
            photos : meetupData.photos,
            videos : meetupData.videos,
            createdTime : moment(Date.now()).utc().format(),
            createdBy : user._id,
            members : [],
            memberLength : 0,
            invitedMembers : [],
            invitedMemberLength : 0,
            checkedIn : [],
            going : [],
            ispublic : meetupData.ispublic,
            pollResult : {
                agreedMembers : [],
                disagreedMembers : [],
                notVotedMembers : [],
                percentageOfAgree : 0,
                percentageOfDisagree : 0,
                percentageOfNotVoted : 0
            }
        }

        var newMeetUp = new _Meetup(data)
        yield newMeetUp.saveToDataBase()

        res.send({ success : true, meetup : newMeetUp._doc })
    }),

    getPublicMeetups : wrapper(function*(req, res) {
        var publicMeetups = yield _Meetup.findAllPublic()
        res.send({ success : true, meetups : publicMeetups })
    }),
    
    getAllMeetups : wrapper(function*(req, res) {
        var allMeetups = yield _Meetup.findAll()
        res.send({ success : true, meetups : allMeetups })
    }),

    gotoMeetup : wrapper(function*(req, res) {
        var user = req.session.user
        var meetupId = req.body.meetupId

        var meetupObj = yield _Meetup.findOneById(meetupId)

        var updatedMembers = Object.assign([], meetupObj.members)
        updatedMembers.push(user._id)

        var updatedGoing = Object.assign([], meetupObj._doc.going)
        updatedGoing.push(user._id)

        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        updatednotVotedMembers.push(user._id)

        var updatedPollResult = {
                agreedMembers : meetupObj.pollResult.agreedMembers,
                disagreedMembers : meetupObj.pollResult.disagreedMembers,
                notVotedMembers : updatednotVotedMembers,
                percentageOfAgree : (meetupObj.pollResult.agreedMembers.length/(meetupObj._doc.memberLength + 1)) * 100,
                percentageOfDisagree : (meetupObj.pollResult.disagreedMembers.length/(meetupObj._doc.memberLength + 1)) * 100,
                percentageOfNotVoted : (updatednotVotedMembers.length/(meetupObj._doc.memberLength + 1)) * 100
        }

        meetupObj.updateField('members', updatedMembers)
        meetupObj.updateField('memberLength', meetupObj._doc.memberLength + 1)
        meetupObj.updateField('going', updatedGoing)
        meetupObj.updateField('pollResult', updatedPollResult)

        yield meetupObj.saveToDataBase()

        res.send({ success : true, meetup : meetupObj._doc })
    }),

    addBuddy : wrapper(function*(req, res) {
        var meetupId = req.body.meetupId
        var buddies = req.body.buddies

        var meetupObj = yield _Meetup.findOneById(meetupId)
        var updatedGoing = Object.assign([], meetupObj._doc.going)
        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        for(var i = 0; i < buddies.length; i ++) {
            updatedGoing.push(buddies[i])
            updatednotVotedMembers.push(buddies[i])
        }

        var updatedPollResult = {
            agreedMembers : meetupObj.pollResult.agreedMembers,
            disagreedMembers : meetupObj.pollResult.disagreedMembers,
            notVotedMembers : updatednotVotedMembers,
            percentageOfAgree : (meetupObj.pollResult.agreedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100,
            percentageOfDisagree : (meetupObj.pollResult.disagreedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100,
            percentageOfNotVoted : (updatednotVotedMembers.length/(meetupObj._doc.memberLength + buddies.length)) * 100
        }
        meetupObj.updateField('going', updatedGoing)
        meetupObj.updateField('pollResult', updatedPollResult)
        yield meetupObj.saveToDataBase()

        res.send({ success : true, meetup : meetupObj._doc })
    }),

    createPoll : wrapper(function*(req, res) {
        var user = req.session.user
        var meetupId = req.body.meetupId
        var poll = req.body.poll

        var meetupObj = yield _Meetup.findOneById(meetupId)
        var updatedagreedMembers = []
        var updateddisagreedMembers = []

        if(poll) {
            updatedagreedMembers = Object.assign([], meetupObj.pollResult.agreedMembers)
            updatedagreedMembers.push(user._id)
            
            updateddisagreedMembers = Object.assign([], meetupObj.pollResult.disagreedMembers)
        }
        else {
            updatedagreedMembers = Object.assign([], meetupObj.pollResult.agreedMembers)
            
            updateddisagreedMembers = Object.assign([], meetupObj.pollResult.disagreedMembers)
            updateddisagreedMembers.push(user._id)
        }
        var updatednotVotedMembers = Object.assign([], meetupObj.pollResult.notVotedMembers)
        var index = updatednotVotedMembers.indexOf(user._id)
        updatednotVotedMembers.splice(index, 1)

        var updatedPollResult = {
            agreedMembers : updatedagreedMembers,
            disagreedMembers : updateddisagreedMembers,
            notVotedMembers : updatednotVotedMembers,
            percentageOfAgree : (updatedagreedMembers.length / meetupObj._doc.memberLength) * 100,
            percentageOfDisagree : (updateddisagreedMembers.length / meetupObj._doc.memberLength) * 100,
            percentageOfNotVoted : (updatednotVotedMembers.length / meetupObj._doc.memberLength) * 100
        }
        meetupObj.updateField('pollResult', updatedPollResult)
        yield meetupObj.saveToDataBase()

        res.send({ success : true, meetup : meetupObj._doc })
    }),

    uploadMedia : wrapper(function*(req, res) {
        var meetup_media_bucket = 'meetup-media';
        var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
        var data = req.body.content;
        var params = { 
            Bucket: meetup_media_bucket, 
            Key: key, 
            Body: data,
            ACL : 'public-read'
        };
        var upload = ( params ) => {
            return new Promise((resolve, reject) => {
                S3.putObject(params, (err, data) => {
                    if(err) reject(err)
                    else resolve(data)
                })
            })
        }

        var status = yield upload(params)
        res.send({ success : true, data : status })
    })
}

module.exports = meetupModule;