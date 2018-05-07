const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
    media_type : {
        type : String,
        default : ''
    },
    media_link : {
        type : String,
        default : ''
    }
});

const mediaModel = mongoose.model('media', mediaSchema);

module.exports = mediaModel;