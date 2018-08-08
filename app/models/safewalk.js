const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const safewalkSchema = new Schema({
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

safewalkSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

const safewalkModel = mongoose.model('safewalk', safewalkSchema);

safewalkModel.findOneById = function( safewalkId ) {
    return new Promise( (resolve, reject) => {
        safewalkModel.findById( safewalkId, (error, safewalk) => {
            if(error) reject(error);
            else resolve(safewalk);
        });
    } );
}

safewalkModel.getNumberOfSafewalkCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        safewalkModel.find({}, (error, safewalks) => {
            if(error) reject(error);
            else {
                var filteredSafewalks = safewalks.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredSafewalks.length);
            }
        });
    } );
}

safewalkModel.getNumberOfSafewalkCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        safewalkModel.find({}, (error, safewalks) => {
            if(error) reject(error);
            else {
                var filteredSafewalks = safewalks.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredSafewalks.length);
            }
        });
    } );
}

safewalkModel.getNumberOfSafewalkByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        safewalkModel.find({}, (error, safewalks) => {
            if(error) reject(error);
            else {
                var filteredSafewalks = safewalks.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredSafewalks.length);
            }
        });
    } );
}

module.exports = safewalkModel;