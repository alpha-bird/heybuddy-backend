const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    channel : { 
        type: String, 
        required: true, 
        unique: true 
    },
    organizer : Object,
    buddy : Object,
    lastMessage : {
        type : String,
        default : ''
    },
    lastTimeStamp : {
        type : String,
        default : ''
    },
});

chatSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

chatSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const chatModel = mongoose.model('chat', chatSchema);

chatModel.findOneById = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        chatModel.findOne({ _id : id }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}
module.exports = chatModel;