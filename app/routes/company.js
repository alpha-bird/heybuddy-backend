const companyController = require('../controllers/company.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.post('/company/create', _AuthCheck, companyController.createCompany);
    router.get('/company/getcompanies', companyController.getAllCompanies);
    router.post('/company/info', _AuthCheck, companyController.getCompanyInfo);
}