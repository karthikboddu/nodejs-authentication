const controller = require('../../controllers/tenant/notes.controller'),
      {authJwt} = require('../../middlewares')

module.exports = function(app) {
    app.use(function(req, res, next) {

      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );

      next();
    });

    app.post("/api/note/notes",[authJwt.verifyToken], controller.create);
    app.get("/api/note/notes",[authJwt.verifyToken], controller.findAll);
    app.get("/api/note/notes/:id",[authJwt.verifyToken], controller.findOne);
    app.put("/api/note/notes/:id",[authJwt.verifyToken], controller.update);
    app.delete("/api/note/notes/:id",[authJwt.verifyToken], controller.delete);
    app.delete("/api/note/notes",[authJwt.verifyToken], controller.deleteAll);

}