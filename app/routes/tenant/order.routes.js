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
    app.post("/api/order/initRoomPayment", [authJwt.verifyToken],controller.initRoomPayment);

    app.post("/api/order/updateOrder", [authJwt.verifyToken],controller.updateOrderStatus);

    app.get("/api/order/tenantRoomOrderDetails",[authJwt.verifyToken], controller.tenantRoomOrderDetails);

    app.get("/api/order/recentAllTenantRoomOrderDetails",[authJwt.verifyToken,authJwt.isAdmin], controller.recentAllTenantRoomOrderDetails);

    app.post("/api/order/createOrderAndComplete", [authJwt.verifyToken],controller.createOrderAndComplete);

    app.get("/api/order/bulkInitRoomPayment", [authJwt.verifyToken,authJwt.isAdmin],controller.bulkInitRoomPayments);


  }