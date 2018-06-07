const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _Company = require('../models/company');

const companyModule = {
    /*
    companyInfo : {
        companyName,
        logo,
        office_phone,
        email
    }
    logoInfo : {
        data,
        type
    }
    accessToken
    */
    createCompany : wrapper(function*( req, res ) {
            var companyLogoUrl = yield utilities.uploadMedia('company', req.body.logoInfo.data, req.body.logoInfo.type)
            
            var newCompany = new _Company( req.body.companyInfo );
            newCompany.updateField('logo', companyLogoUrl);
            yield newCompany.saveToDataBase();
            
            return res.send({ success : true, error : {}, message : 'Success' });
        }),

    getAllCompanies : wrapper( function*( req, res ) {
            var companies = yield _Company.getAllCompanies();
            return res.status(200).send({ success : true, companies : companies, error : {}, messsage : 'Success' });
        }),
    
    getCompanyInfo : wrapper( function*( req, res ) {
            var companyId = req.body.companyId
            var company = yield _Company.findOneById(companyId)

            return res.send({ success : true, company : company._doc })
        }),
    
    getEmployees : wrapper( function*(req, res) {
            var companyId = req.body.companyId
            var company = yield _Company.findOneById(companyId)

            return res.send({ success : true, employees : company._doc.employees})
        })
}

module.exports = companyModule;