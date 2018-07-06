const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calendarEventSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    startDate : {
        type : String,
        required : true
    },
    endDate : {
        type : String,
        required : true
    },
    description : {
        type : String,
        default : ''
    },
    createdTime : {
        type : String,
        required : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    },
    alarmTime : {
        type : String,
        required : true
    }
});

calendarEventSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

calendarEventSchema.methods.removeFromDataBase = function() {
    return new Promise((resolve, reject) => {
        this.remove(function(err){
            if(err) reject(err);
            else resolve();
        });
    });
}

const calendarEventModel = mongoose.model('calendarEvent', calendarEventSchema);

calendarEventModel.getEventCreatedBySomeone = function( userId ) {
    return new Promise( (resolve, reject) => {
        calendarEventModel.find({ createdBy : userId }, (error, todos) => {
            if(error) reject(error);
            else resolve(todos);
        });
    } );
}

calendarEventModel.findOneById = function( eventId ) {
    return new Promise( (resolve, reject) => {
        calendarEventModel.findById( eventId, (error, todo) => {
            if(error) reject(error);
            else resolve(todo);
        });
    } );
}

module.exports = calendarEventModel;