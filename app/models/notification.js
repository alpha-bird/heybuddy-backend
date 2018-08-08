const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
item : {
    title : '',
    description : '',
    image : ''.
    timestamp : '',
    isread : true/false
}
*/

const notificationSchema = new Schema({
    notifications : {
        type : Array,
        default : []
    },
    numberOfRead : {
        type : Number,
        default : 0
    },
    numberOfUnRead : {
        type : Number,
        default : 0
    },
    numberOfNotification : {
        type : Number,
        default : 0
    }
});

notificationSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

notificationSchema.methods.putNotification = function( notification ) {
    this.notifications.push(notification)
    this.numberOfUnRead = this.numberOfUnRead + 1
    this.numberOfNotification = this.notifications.length
}

const notificationModel = mongoose.model('notification', notificationSchema);

notificationModel.findOneById = function( notificationId ) {
    return new Promise( (resolve, reject) => {
        notificationModel.findOne( { _id : notificationId }, (error, notification) => {
            if(error) reject(error)
            else resolve(notification)
        })
    })
}

module.exports = notificationModel;