const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollResultSchema = new Schema({
    agreedMembers : {
        type : Array,
        default : []
    },
    disagreedMembers : {
        type : Array,
        default : []
    },
    notVotedMembers : {
        type : Array,
        default : []
    },
    percentageOfAgree : {
        type : Number,
        default : 0
    },
    percentageOfDisagree : {
        type : Number,
        default : 0
    },
    percentageOfNotVoted : {
        type : Number,
        default : 0
    }
});

const meetupSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        default : ''
    },
    createdTime : {
        type : String,
        default : ''
    },
    organizer : {
        type : Schema.Types.ObjectId,
        required : true
    },
    members : {
        type : Array,
        default : []
    },
    memberLength : {
        type : Number,
        default : 0
    },
    invitedMembers : {
        type : Array,
        default : []
    },
    invitedMemberLength : {
        type : Number,
        default : 0
    },
    pollResult : PollResultSchema,
    checkedIn : {
        type : Array,
        default : []
    },
    going : {
        type : Array,
        default : []
    },
    ispublic : {
        type : Boolean,
        default : false
    }
});

meetupSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

meetupSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const meetupModel = mongoose.model('meetup', meetupSchema);

module.exports = meetupModel;