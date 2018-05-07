const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const notificationModel = mongoose.model('notification', notificationSchema);

module.exports = notificationModel;