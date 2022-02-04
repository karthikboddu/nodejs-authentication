const controller = require('../../controllers/tenant/building.controller'),
      {authJwt} = require('../../middlewares');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get("/api/building/buildings",[authJwt.verifyToken,authJwt.isAdmin], controller.buildings);
    app.post("/api/building/tenantBuildings",[authJwt.verifyToken,authJwt.isAdmin], controller.createTenantBuildings);
    app.get("/api/building/buildings/:buildingId",[authJwt.verifyToken,authJwt.isAdmin], controller.tenantBuildingById);
    app.post("/api/building/tenantBuildingsBlocks/:buildingId",[authJwt.verifyToken,authJwt.isAdmin], controller.createTenantBuildingsBlocks);
    app.get("/api/building/buildingsBlocks/:buildingId",[authJwt.verifyToken,authJwt.isAdmin], controller.buildingsBlocks);

}