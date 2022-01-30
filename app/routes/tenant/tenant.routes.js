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
    
}