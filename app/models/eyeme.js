const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eyemeSchema = new Schema({
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

eyemeSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

const eyemeModel = mongoose.model('eyeme', eyemeSchema);

eyemeModel.findOneById = function( eyemeId ) {
    return new Promise( (resolve, reject) => {
        eyemeModel.findById( eyemeId, (error, eyeme) => {
            if(error) reject(error);
            else resolve(eyeme);
        });
    } );
}

eyemeModel.getNumberOfEyemeCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        eyemeModel.find({}, (error, eyemes) => {
            if(error) reject(error);
            else {
                var filteredEyemes = eyemes.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredEyemes.length);
            }
        });
    } );
}

eyemeModel.getNumberOfEyemeCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        eyemeModel.find({}, (error, eyemes) => {
            if(error) reject(error);
            else {
                var filteredEyemes = eyemes.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredEyemes.length);
            }
        });
    } );
}

eyemeModel.getNumberOfEyemeByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        eyemeModel.find({}, (error, eyemes) => {
            if(error) reject(error);
            else {
                var filteredEyemes = eyemes.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredEyemes.length);
            }
        });
    } );
}

module.exports = eyemeModel;