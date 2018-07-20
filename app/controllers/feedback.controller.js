const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user'),
      _Feedback = require('../models/feedback');

const feedbackModule = {
    createFeedback : wrapper(function*( req, res ) {
        var feedback = new _Feedback({
            rating : req.body.rating,
            feedback : req.body.feedback,
            feedbackFrom : req.session.user._id
        })
        yield feedback.saveToDataBase()

        res.send({
            success : true,
            feedback : {
                rating : req.body.rating,
                feedback : req.body.feedback,
                feedbackFrom : req.session.user
            }
        })
    }),

    getFeedback : wrapper(function*(req, res) {
        var feedbacks = yield _Feedback.getAllFeedback()
        for(var i = 0; i < feedbacks.length; i ++ ) {
            feedbacks[i].feedbackFrom = yield _User.findOneById(feedbacks[i].feedbackFrom)
        }

        res.send({
            success : true,
            feedbacks : feedbacks
        })
    })
}

module.exports = feedbackModule;