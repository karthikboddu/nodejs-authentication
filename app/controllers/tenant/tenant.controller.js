const errorCode = require('../../common/errorCode'),
      {listTenants,saveTenants,logInTenants,saveSSOTenants} = require('../../services/tenant/tenant.service'),
      {getRolesByName}  = require('../../helpers/roles.helper');

exports.tenants = async (req, res, next) => {

    try {
      let {page, size} = req.query;
      if (!page) {
          page = 1;
      }
      if (!size) {
          size = 100;
      }
      const buildingId = req.query.buildingId ? req.query.buildingId : null;
      const limit = parseInt (size);
      const skip = (page - 1) * size;
        const result = await listTenants(req, limit, skip, buildingId);
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