const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const anonymousTipSchema = new Schema({
    incidentCategory : {
        type: String, 
        required: true
    },
    location : {
        address : String,
        latitude : {
            type : Number,
            default : 0
        },
        longitude : {
            type : Number,
            default : 0
        },
    },
    description : {
        type : String,
        default : ''
    },
    isAnonymoustip : {
        type : Boolean,
        default : true
    },
    peopleInvolved : {
        type : Array,
        default : []
    },
    media : {
        type : Array,
        default : []
    },
    createdTime : {
        type : String,
        required : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    }
});

anonymousTipSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

anonymousTipSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const anonymousTipModel = mongoose.model('anonymoustip', anonymousTipSchema);

anonymousTipModel.findAllByUserID = function( userId ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find( { createdBy : userId } ,(err, tips) => {
            if(err) reject(err)
            else resolve(tips)
        })
    })
}

anonymousTipModel.findAllPublic = function( ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find( { isAnonymoustip : true } ,(err, tips) => {
            if(err) reject(err)
            else resolve(tips)
        })
    })
}

anonymousTipModel.findAll = function( ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({}, (error, tips) => {
            if(error) reject(error);
            else resolve(tips);
        });
    } );
}

anonymousTipModel.findByCategory = function( category ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({ incidentCategory : category }, (error, tips) => {
            if(error) reject(error);
            else resolve(tips);
        });
    } );
}
module.exports = anonymousTipModel;