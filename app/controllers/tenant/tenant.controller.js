const errorCode = require('../../common/errorCode'),
      _ = require('lodash'),
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
    
    if(!tenantData) {
        return res.status(500).send({ message: errorCode.BAD_REQUEST });
    }
    const userRole = tenantData.userRole ? tenantData.userRole : 'user';
    try {
      
        const role = await getRolesByName(userRole);
        
        const result = await saveTenants(tenantData,role,parentId);
        res.send(result);
      } catch (error) {
        return res.send(error);
      }

}

exports.signInTenant = async (req, res, next) => {
    const {username,password} = req.body;

    if(!username || !password) {
      res.api.status = 400;
      res.api.errors.code = errorCode.BAD_REQUEST;
      res.api.errors.message = 'Validation error';
      req.app.get('log').error(_.assign(req.app.get('logEntry'), {
        'status': res.api.status
      }));
      
      return res.status(500).send(res.api);
    }
   

    try {

      const result = await logInTenants(req, res, username, password);
      
      res.send(result);
    } catch (error) {
      return next(error);
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

exports.getGlobalSettings = async (req, res, next) => {

  try {
      const data = {
        googleRecaptcha : process.env.GOOGLE_RECAPTCHA_KEY,
        paymentEnv : process.env.PAYMENT_ENV,
        signUpEnabled: process.env.SIGN_UP_ENABLED,
        ssoEnabled : process.env.SSO_ENABLED,
        googleSettings : {
          expoClientId : process.env.EXPO_CLIENT_ID,
          iosClientId : process.env.IOS_CLIENT_ID,
          androidClientId : process.env.ANDRIOD_CLIENT_ID,
          webClientId : process.env.WEB_CLIENT_ID, 
        }
      }
      res.api.data = data;
      return res.status(200).send(res.api);
  } catch (error) {
    return next(error);
  }

}

exports.getTenantsSettings = async (req, res, next) => {

  try {
      const data = {
        aesKey: process.env.AES_KEY,
        aesIv : process.env.AES_IV,
        aesAlgo : process.env.AES_ALGO,
        googleRecaptcha : process.env.GOOGLE_RECAPTCHA_KEY,
        paymentEnabled : process.env.PAYMENT_ENABLED,
        paymentMethod : process.env.PAYMENT_METHOD,
        paymentEnv : process.env.PAYMENT_ENV,
        paytmPaymentSettings : {
          merchantId : process.env.MID,
          merchantKey : process.env.MERCHANT_KEY,
          callBackUrl : process.env.CALL_BACK_URL,
          urlScheme : process.env.URL_SCHEME
        },
        googleSettings : {
          expoClientId : process.env.EXPO_CLIENT_ID,
          iosClientId : process.env.IOS_CLIENT_ID,
          androidClientId : process.env.ANDRIOD_CLIENT_ID,
          webClientId : process.env.WEB_CLIENT_ID, 
        }
      }
      res.api.data = data;
      return res.status(200).send(res.api);
  } catch (error) {
    return next(error);
  }

}