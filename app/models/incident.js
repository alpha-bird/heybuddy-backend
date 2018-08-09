const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/*
Media element schema
{
    type : 'Picture/Video',
    url : ''
}
*/

const incidentSchema = new Schema({
    status : {
        type : String,
        default : 'open',
    },
    createdTime : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    geo : {
        address : {
            type : String,
        },
        latitude : {
            type : Number,
            default : 0
        },
        longitude : {
            type : Number,
            default : 0
        }
    },
    medias : {
        type : Array,
        default : []
    },
    reporter : {
        reporterId : {
            type : Schema.Types.ObjectId,
            ref: 'user',
            required : true
        },
        email : {
            type : String,
            required : true
        },
        firstname : {
            type : String,
            required : true
        },
        lastname : {
            type : String,
            required : true
        }
    },
    responses : {
        type : Array,
        default : []
    },
    comments : {
        type : Array,
        default : []
    }
});

incidentSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

incidentSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

incidentSchema.methods.search = function( content ) {
    return this.createdTime.includes(content) ||
           this.description.includes(content) || 
           this.reporter.email.includes(content) || 
           this.reporter.firstname.includes(content) || 
           this.reporter.lastname.includes(content)
}

const incidentModel = mongoose.model('incident', incidentSchema);

incidentModel.getAllIncidents = function( ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else resolve(incidents);
        });
    } );
}

incidentModel.findOneById = function( incidentId ) {
    return new Promise( ( resolve, reject ) => { 
        incidentModel.findOne({ _id : incidentId }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

incidentModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else {
                var filteredIncidents = incidents.filter( value => {
                    return value.search(content)
                })
                resolve(filteredIncidents);
            }
        });
    } );
}

incidentModel.getNumberOfIncidentCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else {
                var filteredIncident = incidents.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredIncident.length);
            }
        });
    } );
}

incidentModel.getNumberOfIncidentCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else {
                var filteredIncident = incidents.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredIncident.length);
            }
        });
    } );
}

incidentModel.getNumberOfIncidentByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else {
                var filteredIncident = incidents.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredIncident.length);
            }
        });
    } );
}

incidentModel.getNumberOfIncidentOpen = function( ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({ status : 'open' }, (error, incidents) => {
            if(error) reject(error);
            else {
                resolve(incidents.length);
            }
        });
    } );
}

incidentModel.getNumberOfIncidentClosed = function( ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({ status : 'closed' }, (error, incidents) => {
            if(error) reject(error);
            else {
                resolve(incidents.length);
            }
        });
    } );
}


incidentModel.getTotal = function( ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({ }, (error, incidents) => {
            if(error) reject(error);
            else {
                resolve(incidents.length);
            }
        });
    } );
}

module.exports = incidentModel;