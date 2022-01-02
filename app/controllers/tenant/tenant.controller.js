const errorCode = require('../../common/errorCode'),
      tenant = require('../../models/tenant'),
      {listTenants,saveTenants} = require('../../services/tenant/tenant.service');

exports.tenants = async (req, res, next) => {

    try {
        const result = await listTenants();
        res.send(result);
      } catch (error) {
        return res.send(error);
      }

    // const result = {
    //     status: 200,
    //     errors: 'error',
    //     data: '',
    //   }
    //   return res.send(result);
}

exports.createTenant = async (req, res, next) => {

    const tenantData = req.body;

    if(!tenantData) {
        res.status(500).send({ message: 'invalid' });
    }
    try {
        const result = await saveTenants(req, res, tenantData);
        res.send(result);
      } catch (error) {
        return res.send(error);
      }

    // const result = {
    //     status: 200,
    //     errors: 'error',
    //     data: '',
    //   }
    //   return res.send(result);
}