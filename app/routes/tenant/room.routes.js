const controller = require('../../controllers/tenant/rooms.controller'),
      {authJwt} = require('../../middlewares');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get("/api/rooms/:floorId",[authJwt.verifyToken,authJwt.isAdmin], controller.rooms);
    app.post("/api/room/:floorId",[authJwt.verifyToken,authJwt.isAdmin], controller.createRoom);

}