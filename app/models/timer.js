const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timerSchema = new Schema({
    details : {
        type : String,
        required : true
    },
    createdTime : {
        type : String,
        required : true
    },
    estimationOfCompletionTime : {
        type : String,
        required : true
    },
    duration : {
        type : Number,
        required : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    },
    viewers : {
        type : Array,
        default : []
    },
    cronJob : {
        type : Object,
        required : true
    },
    status : {
        type : String,
        default : 'open'
    }
});

timerSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

timerSchema.methods.saveToDataBase = function() {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const timerModel = mongoose.model('timer', timerSchema);

timerModel.findOneById = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        timerModel.findOne({ _id : id }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

timerModel.findTimersByCreater = function( userId ) {
    return new Promise( (resolve, reject) => {
        timerModel.find(
            { 
                createdBy : userId
            }, 
            (err, res) => {
            if(err) reject(err);
            else resolve(res);
        })
    })
}

timerModel.findAll = function( ) {
    return new Promise( (resolve, reject) => {
        timerModel.find( { }, (error, timers) => {
            if(error) reject(error)
            else resolve(timers)
        })
    })
}

module.exports = timerModel;