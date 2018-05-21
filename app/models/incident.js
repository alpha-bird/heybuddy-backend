const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
    companyName : { type: String, required: true, unique: true },
    logo : String,
    office_phone : String,
    email : String,
});

companySchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

companySchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

const companyModel = mongoose.model('company', companySchema);

companyModel.getAllCompanies = function( ) {
    return new Promise( (resolve, reject) => {
        companyModel.find({}, (error, companies) => {
            if(error) reject(error);
            else resolve(companies);
        });
    } );
}
module.exports = companyModel;