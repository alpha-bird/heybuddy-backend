const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    rating : {
        type : Number,
        required : true
    },
    feedback : {
        type : String,
        required : true
    },
    feedbackFrom : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    }
});

feedbackSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const feedbackModel = mongoose.model('feedback', feedbackSchema);

feedbackModel.getAllFeedback = function( ) {
    return new Promise( (resolve, reject) => {
        feedbackModel.find({}, (error, feedbacks) => {
            if(error) reject(error);
            else resolve(feedbacks);
        });
    } );
}

module.exports = feedbackModel;