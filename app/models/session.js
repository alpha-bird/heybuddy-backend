const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    userId : {
        type : String,
        required: true, 
        unique: true
    },
    pushId : {
        type : String,
        required: true
    },
    status : {
        type : Number,
        default : 1
    } // 1 : online , 0 : not available
});

sessionSchema.methods.saveToDataBase = function() {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

sessionSchema.methods.removeFromDataBase = function() {
    return new Promise((resolve, reject) => {
        this.remove(function(err){
            if(err) reject(err);
            else resolve();
        });
    });
}

sessionSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

const sessionModel = mongoose.model('session', sessionSchema);

sessionModel.findSessionByUserID = function( userId ) {
    return new Promise( (resolve, reject) => {
        sessionModel.findOne({ userId : userId }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

sessionModel.findSessionByID = function( sessionId ) {
    return new Promise( (resolve, reject) => {
        sessionModel.findOne({ _id : sessionId }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

sessionModel.getStatusByUserID = ( userId ) => {
    return new Promise( ( resolve, reject ) => {
        sessionModel.findOne( { userId : userId }, ( error, oneSession ) => {
            if( error ) reject(error);
            else {
                if( oneSession ) {
                    resolve( oneSession.status );
                }
                else { 
                    resolve( 0 );
                }
            }
        });
    });
}

sessionModel.getPushTokenByUserID = ( userId ) => {
    return new Promise( ( resolve, reject ) => {
        sessionModel.findOne( { userId : userId }, ( error, oneSession ) => {
            if( error ) reject(error);
            else {
                if( oneSession ) {
                    resolve( oneSession.pushId );
                }
                else {
                    resolve('');
                }
            }
        });
    });
}

module.exports = sessionModel;