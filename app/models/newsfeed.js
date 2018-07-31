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
        count : {
            type : Number,
            default : 0
        },
        likedBy : {
            type : Array,
            default : []
        }
    },
    comments : {
        count : {
            type : Number,
            default : 0
        },
        commentedBy : {
            type : Array,
            default : []
        }
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

newsfeedSchema.methods.search = function( content ) {
    return this.description.includes(content) || this.createdTime.includes(content);
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

newsfeedModel.findAll = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        newsfeedModel.find({ }, (err, newsfeeds) => {
            if(err) reject(err);
            else resolve(newsfeeds);
        });
    });
}

newsfeedModel.findAllCreatedBySomeone = function( userId ) {
    return new Promise( ( resolve, reject ) => { 
        newsfeedModel.findOne({ createdBy : userId }, (err, newsfeeds) => {
            if(err) reject(err);
            else resolve(newsfeeds);
        });
    });
}

newsfeedModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        newsfeedModel.find({}, (error, newsfeeds) => {
            if(error) reject(error);
            else {
                var filteredNewsfeeds = newsfeeds.filter( value => {
                    return value.search(content)
                })
                resolve(filteredNewsfeeds);
            }
        });
    } );
}

module.exports = newsfeedModel;