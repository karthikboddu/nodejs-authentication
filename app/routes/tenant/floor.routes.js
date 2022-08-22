const controller = require('../../controllers/tenant/floor.controller'),
      {authJwt} = require('../../middlewares');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get("/api/floor/floors/:buildingId",[authJwt.verifyToken,authJwt.isAdmin], controller.floorsByBuildingId);
    app.post("/api/floor/building/:buildingId/block/:blockId",[authJwt.verifyToken,authJwt.isAdmin], controller.saveFloors);
    app.post("/api/floor/building/:buildingId",[authJwt.verifyToken,authJwt.isAdmin], controller.saveFloors);
}