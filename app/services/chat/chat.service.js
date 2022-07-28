const db = require("../../models"),
    userConversations = db.tenant.userConversation,
    Promise = require('bluebird');
    const _           = require('lodash');
var mongoose = require('mongoose');
const { findUserConversationByFromTenantIdAndFromTenantId,
    findUserConversationFromTenantIdAndFromTenantIdAgg } = require("../../repository/UserConversationRepository");



const listChatConversations = async (req, res, tenantId, skip, limit, toTenantId) => {

        try {
            const data = await findUserConversationByFromTenantIdAndFromTenantId(tenantId, skip, limit, toTenantId);
            console.log(data,"data")
            return data;
        } catch (error) {
            console.log(error)
            return error;
        }
 
}



const saveChatConversations = async (req, res, data, tenantId, parentId) => {

    return new Promise((resolve, reject) => {
        try {
            const userConversationObject = new userConversations({
                from_tenant_id: tenantId,
                to_tenant_id: data.toTenantId,
                parent_id: parentId,
                text: data.text,
                asset_url: data.assetUrl ? data.assetUrl : null,
                asset_type: data.assetType ? data.assetType : 'TEXT',
            });
            userConversationObject.save((err, t) => {
                if (err) {
                    reject({ status: 500, message: err })
                }
                resolve({
                    status: 200,
                    data: t,
                    message: "Chat created successfully!"
                });
            });
        } catch (error) {
            reject({ status: 500, message: error })
        }
    })


}

const transformRecord = (record) => {
    return {
        _id: record._id,
        from_tenant_id: record.from_tenant_id,
        parent_id: record.parent_id,
        text: record.text,
        user:  trasformUserRecord(record.to_tenant_id),
        asset_url: record.asset_url,
        asset_type: record.asset_type,
        seen: record.seen,
        sent: record.sent,
        received: record.received,
        pending: record.pending,
        is_active: record.is_active,
        created_at: record.created_at,
        updated_at: record.updated_at
    };
}

function trasformUserRecord (record)  {
    return {
        _id : record._id,
        name : record.full_name,
        avatar : record.photoUrl
    }
}


module.exports = {
    listChatConversations,
    saveChatConversations,
    transformRecord
};
