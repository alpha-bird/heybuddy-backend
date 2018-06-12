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