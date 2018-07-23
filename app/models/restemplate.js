const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseTemplateSchema = new Schema({
    responseBody : {
        type : String,
        required : true
    }
});

responseTemplateSchema.methods.saveToDataBase = function() {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

const responseModel = mongoose.model('restemplate', responseTemplateSchema);

responseModel.getAllTemplates = function() {
    return new Promise( (resolve, reject) => {
        responseModel.find({}, (error, restemplates) => {
            if(error) reject(error)
            else resolve(restemplates)
        })
    })
}
module.exports = responseModel;