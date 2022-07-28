const controller = require('../../controllers/chat/chat.controller'),
      {authJwt} = require('../../middlewares')

module.exports = function(app) {
    app.use(function(req, res, next) {

      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );

      next();
    });

    app.post("/api/chat/chats",[authJwt.verifyToken], controller.createChatConversation);
    app.get("/api/chat/chats/:tenantId",[authJwt.verifyToken], controller.listChatConversationByTenant);
    app.get("/api/chat/conversations",[authJwt.verifyToken], controller.listAllTenantConversations);


}