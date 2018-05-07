const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supportsessionSchema = new Schema({
    userId : {
        type : String,
        required: true, 
    },
    code : {
        type : String,
        required: true, 
    }
});

supportsessionSchema.methods.saveToDataBase = function() {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const supportsessionModel = mongoose.model('supportsession', supportsessionSchema);

module.exports = supportsessionModel;