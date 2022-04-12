const controller = require('../../controllers/tenant/order.controller'),
      {authJwt} = require('../../middlewares')

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    }); 

    app.post("/api/order/generatePaytmToken", [authJwt.verifyToken],controller.createPaytmToken);
}