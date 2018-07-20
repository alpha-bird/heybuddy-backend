const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
item : {
    title : '',
    description : '',
    datetime : '',
    image : ''
}
*/

const notificationSchema = new Schema({
    newnotifications : {
        type : Array,
        default : []
    },
    oldnotifications : {
        type : Array,
        default : []
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
    this.newnotifications.push(notification)
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