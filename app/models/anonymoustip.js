const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const anonymousTipSchema = new Schema({
    incident_category : {
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
    date : {
        type : String,
        default : ''
    },
    time : {
        type : String,
        default : ''
    },
    description : {
        type : String,
        default : ''
    },
    is_anonymous_tip : {
        type : Boolean,
        default : true
    },
    people_involved : {
        type : Array,
        default : []
    },
    media : {
        type : Array,
        default : []
    }
});

const anonymousTipModel = mongoose.model('anonymoustip', anonymousTipSchema);

module.exports = anonymousTipModel;