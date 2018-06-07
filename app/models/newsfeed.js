const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsfeedSchema = new Schema({
    createdTime : {
        type : String,
        required : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    },
    description : {
        type : String,
        default : ''
    },
    media : {
        type : Array,
        default : []
    },
    likes : {
        type : Number,
        default : 0
    },
    comments : {
        type : Number,
        default : 0
    }
});

newsfeedSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

newsfeedSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const newsfeedModel = mongoose.model('newsfeed', newsfeedSchema);

newsfeedModel.findOneById = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        newsfeedModel.findOne({ _id : id }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}
module.exports = chatModel;