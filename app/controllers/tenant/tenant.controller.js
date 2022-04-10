const errorCode = require('../../common/errorCode'),
      {listTenants,saveTenants,logInTenants,saveSSOTenants} = require('../../services/tenant/tenant.service'),
      {getRolesByName}  = require('../../helpers/roles.helper');

exports.tenants = async (req, res, next) => {

    try {
        const result = await listTenants(res);
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
}

exports.createTenant = async (req, res, next) => {

    const tenantData = req.body;
    const parentId = req.userId ? req.userId : null;
    console.log(parentId,"parentid")
    if(!tenantData) {
        res.status(500).send({ message: errorCode.BAD_REQUEST });
    }
    try {
        const role = await getRolesByName(tenantData.userRole);
        const result = await saveTenants(tenantData,role,parentId);
        res.send(result);
      } catch (error) {
        return res.send(error);
      }

}

exports.signInTenant = async (req, res, next) => {
    const tenantLoginData = req.body;
    if(!tenantLoginData) {
      res.status(500).send({ message: errorCode.BAD_REQUEST });
    }

    try {
      const result = await logInTenants(tenantLoginData);
      res.send(result);
    } catch (error) {
      return res.send(error);
    }
}


exports.createTenantSSOLogin = async (req, res, next) => {

  const tenantData = req.body;
  const parentId = req.userId ? req.userId : null;
  
  if(!tenantData) {
      res.status(500).send({ message: errorCode.BAD_REQUEST });
  }
  try {
      const role = await getRolesByName("user");
      const result = await saveSSOTenants(tenantData,role,parentId);
      res.send(result);
    } catch (error) {
      return res.send(error);
    }

}