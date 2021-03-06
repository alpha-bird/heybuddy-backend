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

anonymousTipSchema.methods.search = function( content ) {
    return this.incidentCategory.includes(content) || this.description.includes(content) || this.createdTime.includes(content) 
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

anonymousTipModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({}, (error, tips) => {
            if(error) reject(error);
            else {
                var filteredTips = tips.filter( value => {
                    return value.search(content)
                })
                resolve(filteredTips);
            }
        });
    } );
}

anonymousTipModel.getNumberOfAnonymousTipCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({}, (error, tips) => {
            if(error) reject(error);
            else {
                var filteredAnonymousTip = tips.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredAnonymousTip.length);
            }
        });
    } );
}

anonymousTipModel.getNumberOfAnonymousTipCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({}, (error, tips) => {
            if(error) reject(error);
            else {
                var filteredAnonymousTip = tips.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredAnonymousTip.length);
            }
        });
    } );
}

anonymousTipModel.getNumberOfAnonymousTipByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        anonymousTipModel.find({}, (error, tips) => {
            if(error) reject(error);
            else {
                var filteredAnonymousTip = tips.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredAnonymousTip.length);
            }
        });
    } );
}
module.exports = anonymousTipModel;