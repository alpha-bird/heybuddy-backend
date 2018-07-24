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

            return res.send({ success : true, company : company })
        }),
    
    getEmployees : wrapper( function*(req, res) {
            var companyId = req.body.companyId
            var company = yield _Company.findOneById(companyId)

            return res.send({ success : true, employees : company.employees})
        }),

    uploadMedia : wrapper(function*(req, res) {
            var company_media_bucket = 'company-logo-media';
            var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
            var data = req.body.content;
            var params = { 
                Bucket: company_media_bucket, 
                Key: key, 
                Body: data,
                ACL : 'public-read'
            };
            var upload = ( params ) => {
                return new Promise((resolve, reject) => {
                    S3.putObject(params, (err, data) => {
                        if(err) reject(err)
                        else resolve(data)
                    })
                })
            }

            var status = yield upload(params)
            res.send({ success : true, data : status })
        })
}

module.exports = companyModule;