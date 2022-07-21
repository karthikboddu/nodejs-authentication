const controller = require('../../controllers/tenant/tenant.controller'),
      {authJwt} = require('../../middlewares')

module.exports = function(app) {
    app.use(function(req, res, next) {

      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    }); 


    app.get("/api/tenant/tenants",[authJwt.verifyToken,authJwt.isAdmin], controller.tenants);
    app.post("/api/tenant/tenants", [authJwt.verifyToken],controller.createTenant);
    app.post("/api/tenant/login", controller.signInTenant);
    app.post("/api/tenant/SSOLogin",controller.createTenantSSOLogin);
    app.get("/api/tenant/settings",[authJwt.verifyToken], controller.getGlobalSettings);
    app.patch("/api/tenant/tenant",[authJwt.verifyToken], controller.updateTenant);

}