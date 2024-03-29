const { getPagination } = require("../../common/util");
const errorCode = require('../../common/errorCode');
const _           = require('lodash');
const {listChatConversations, saveChatConversations, transformRecord,getAllTenantConversationList,
    transformAllConversationByTenantData} = require('../../services/chat/chat.service')


exports.createChatConversation = async (req, res, next) => {
    try {
        const chatData = req.body;
        if(!chatData) {
          return res.status(500).send({ message: errorCode.BAD_REQUEST });
        }
        
        const result = await saveChatConversations(chatData, req.userId, req.parentId)
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}



exports.listChatConversationByTenant = async (req, res, next) => {
    try {
        let {page, size} = req.query;
        if (!page) {
            page = 1;
        }
        if (!size) {
            size = 10;
        }

        const tenantId = req.params.tenantId;
        if(!tenantId) {
            return res.status(500).send({ message: errorCode.BAD_REQUEST });
        }
        const limit = parseInt (size);
        const skip = (page - 1) * size;
        console.log(tenantId)
        const result = await listChatConversations(req, res, req.userId, skip, limit, tenantId);
        const totalCount = result ? result.length : 0;

        const pagination = getPagination(page, size, totalCount);
        res.api.data = {
          conversation : _.map(result.data, (record) => transformRecord(record)),
          _pagination : pagination
        };
        req.app.get('log').info(_.assign(req.app.get('logEntry'), {
          'status': res.api.status
        }));
  
        res.send(res.api);
    } catch (error) {
        return res.send(error);
    }
}


exports.listAllTenantConversations = async (req, res, next) => {

    try {
        let {page, size} = req.query;
        if (!page) {
            page = 1;
        }
        if (!size) {
            size = 10;
        }
        const limit = parseInt (size);
        const skip = (page - 1) * size;
        
        const result = await getAllTenantConversationList(req.userId, skip, limit);
        
        const totalCount = result ? result.length : 0;

        const pagination = getPagination(page, size, totalCount);
        res.api.data = {
          conversations : _.map(result.data, (record) => transformAllConversationByTenantData(record, req.userId)),
          _pagination : pagination
        };
        req.app.get('log').info(_.assign(req.app.get('logEntry'), {
          'status': res.api.status
        }));
  
        res.send(res.api);
    } catch (error) {
        return res.send(error);
    }
}
