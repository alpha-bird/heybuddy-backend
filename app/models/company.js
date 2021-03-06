const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    companyName : { 
        type: String, 
        required: true,
    },
    logo : String,
    office_phone : String,
    email : {
        type : String,
        required : true
    },
    employees : {
        type : Array,
        default : []
    }
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

companySchema.methods.search = function( content ) {
    return this.companyName.includes(content) ||  this.office_phone.includes(content) || this.email.includes(content)
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

companyModel.findOneById = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        companyModel.findOne({ _id : id }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

companyModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        companyModel.find({}, (error, companies) => {
            if(error) reject(error);
            else {
                var filteredCompanies = companies.filter( value => {
                    return value.search(content);
                })
                resolve(filteredCompanies);
            }
        });
    } );
}

module.exports = companyModel;