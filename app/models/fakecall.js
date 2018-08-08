const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fakecallSchema = new Schema({
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

fakecallSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

const fakecallModel = mongoose.model('fakecall', fakecallSchema);

fakecallModel.findOneById = function( fakecallId ) {
    return new Promise( (resolve, reject) => {
        fakecallModel.findById( fakecallId, (error, fakecall) => {
            if(error) reject(error);
            else resolve(fakecall);
        });
    } );
}

fakecallModel.getNumberOfFakecallCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        fakecallModel.find({}, (error, fakecalls) => {
            if(error) reject(error);
            else {
                var filteredFakecalls = fakecalls.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredFakecalls.length);
            }
        });
    } );
}

fakecallModel.getNumberOfFakecallCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        fakecallModel.find({}, (error, fakecalls) => {
            if(error) reject(error);
            else {
                var filteredFakecalls = fakecalls.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredFakecalls.length);
            }
        });
    } );
}

fakecallModel.getNumberOfFakecallByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        fakecallModel.find({}, (error, fakecalls) => {
            if(error) reject(error);
            else {
                var filteredFakecalls = fakecalls.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredFakecalls.length);
            }
        });
    } );
}

module.exports = fakecallModel;