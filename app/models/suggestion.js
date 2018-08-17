const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suggestionSchema = new Schema({
    region : {
        latitude : {
            type : Number,
            default : 0
        },
        longitude : {
            type : Number,
            default : 0
        },
        latitudeDelta : {
            type : Number,
            default : 0
        },
        longitudeDelta : {
            type : Number,
            default : 0
        }
    },
    category : {
        type : String,
        required : true
    },
    suggestion : {
        type : String,
        default : ''
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    }
});

suggestionSchema.methods.saveToDataBase = function() {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

suggestionSchema.methods.removeFromDataBase = function() {
    return new Promise((resolve, reject) => {
        this.remove(function(err){
            if(err) reject(err);
            else resolve();
        });
    });
}

suggestionSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

const suggestionModel = mongoose.model('suggestion', suggestionSchema);

module.exports = suggestionModel;