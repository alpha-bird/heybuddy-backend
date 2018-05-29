const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
    incidentId : {
        type : String,
        unique : true,
        required : true
    },
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
    reporter : {
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

const incidentModel = mongoose.model('incident', incidentSchema);

incidentModel.getAllIncidents = function( ) {
    return new Promise( (resolve, reject) => {
        incidentModel.find({}, (error, incidents) => {
            if(error) reject(error);
            else resolve(incidents);
        });
    } );
}

module.exports = incidentModel;