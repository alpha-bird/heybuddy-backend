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
    location : {
        latitude : {
            type : Number,
            default : 0
        },
        longitude : {
            type : Number,
            default : 0
        }
    },
    photos : {
        type : Array,
        default : []
    },
    videos : {
        type : Array,
        default : []
    },
    createdTime : {
        type : String,
        default : ''
    },
    createdBy : {
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

meetupSchema.methods.search = function( content ) {
    return this.title.includes(content) ||  this.description.includes(content) || this.createdTime.includes(content);
}

const meetupModel = mongoose.model('meetup', meetupSchema);

meetupModel.findOneById = function( meetupId ) {
    return new Promise( (resolve, reject) => {
        meetupModel.findOne( { _id : meetupId }, (error, meetup) => {
            if(error) reject(error)
            else resolve(meetup)
        })
    })
}

meetupModel.findAllPublic = function( ) {
    return new Promise( (resolve, reject) => {
        meetupModel.find( { ispublic : true }, (error, meetups) => {
            if(error) reject(error)
            else resolve(meetups)
        })
    })
}

meetupModel.findAll = function( ) {
    return new Promise( (resolve, reject) => {
        meetupModel.find( { }, (error, meetups) => {
            if(error) reject(error)
            else resolve(meetups)
        })
    })
}

meetupModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        meetupModel.find({}, (error, meetups) => {
            if(error) reject(error);
            else {
                var filteredMeetups = meetups.filter( value => {
                    return value.search(content)
                })
                resolve(filteredMeetups);
            }
        });
    } );
}

meetupModel.getNumberOfMeetupCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        meetupModel.find({}, (error, meetups) => {
            if(error) reject(error);
            else {
                var filteredMeetup = meetups.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredMeetup.length);
            }
        });
    } );
}

meetupModel.getNumberOfMeetupCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        meetupModel.find({}, (error, meetups) => {
            if(error) reject(error);
            else {
                var filteredMeetup = meetups.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredMeetup.length);
            }
        });
    } );
}

meetupModel.getNumberOfMeetupByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        meetupModel.find({}, (error, meetups) => {
            if(error) reject(error);
            else {
                var filteredMeetup = meetups.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredMeetup.length);
            }
        });
    } );
}
module.exports = meetupModel;