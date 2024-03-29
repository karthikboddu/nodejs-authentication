const db = require("../../models"),
    userConversations = db.tenant.userConversation,
    lastConversation = db.tenant.lastConversation,
    Promise = require('bluebird');
    const _           = require('lodash');
var mongoose = require('mongoose');
const { findUserConversationByFromTenantIdAndFromTenantId,
    findUserConversationFromTenantIdAndFromTenantIdAgg,
    findAllLastConversations } = require("../../repository/UserConversationRepository");



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



const saveChatConversations = async ( data, tenantId, parentId) => {

    return new Promise((resolve, reject) => {
        try {

            let from = mongoose.Types.ObjectId(tenantId);
            let to = mongoose.Types.ObjectId(data.toTenantId);
            lastConversation.findOneAndUpdate(
                {
                    recipients: {
                        $all: [
                            { $elemMatch: { $eq: from } },
                            { $elemMatch: { $eq: to } },
                        ],
                    },
                },
                {
                    recipients: [tenantId, data.toTenantId],
                    lastMessage: data.text,
                    parent_id : parentId,
                    updated_at: Date.now(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true,useFindAndModify: false })
                .exec(function(err, conversation) {
                    if(err) {
                        console.log(tenantId,"err",err)
                        reject({ status: 500, message: err })
                    } else {
                        
                        const userConversationObject = new userConversations({
                            from_tenant_id: tenantId,
                            to_tenant_id: data.toTenantId,
                            parent_id: parentId,
                            text: data.text ? data.text : " ",
                            asset_url: data.assetUrl ? data.assetUrl : null,
                            asset_type: data.assetType ? data.assetType : 'TEXT',
                        });
                        userConversationObject.save((err, t) => {
                            if (err) {
                                reject({ status: 500, message: err })
                                return
                            }
                            t.populate({path: 'from_tenant_id',
                            select: ['username', 'full_name', 'email', 'mobile_no', 'address', 'start_at', 'end_at', 'created_at', 'photoUrl']}, function(err, book) {

                               if (err) {
                                reject({ status: 500, message: err })
                                return
                                } else {
                                    resolve({
                                        status: 200,
                                        data: transformRecord(book),
                                        message: "Chat created successfully!"
                                    });
                                }
                            })


                        })
                    }
                })
 
        } catch (error) {
            reject({ status: 500, message: error })
        }
    })
}

const getAllTenantConversationList = async(tenantId, skip, limit) => {
    try {
        const data = await findAllLastConversations(tenantId, skip, limit);
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const transformRecord = (record) => {
    console.log(record)
    return {
        _id: record._id,
        from_tenant_id: record.from_tenant_id,
        parent_id: record.parent_id,
        text: record.text,
        user:  trasformUserRecord(record.from_tenant_id),
        image: record.asset_type == "IMAGE" ? record.asset_url : null,
        video : record.asset_type == "VIDEO" ? record.asset_url : null,
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

const transformAllConversationByTenantData = (record, tenantId) => {
    let users = {}; 
    let fromUsers = {}; 
    record.recipients.forEach(element => {
        if (element._id != tenantId) {
            users = element;
        } else {
            fromUsers = element;
        }
    });
    return {
        _id: record._id,
        from_tenant_id: tenantId,
        fromUser : trasformUserRecord(fromUsers),
        lastMessage: record.lastMessage,
        user:  trasformUserRecord(users),
        seen: record.seen,
        parentId : record.parent_id,
        isActive: record.is_active,
        createdAt: record.created_at,
        updatedAt: record.updated_at
    }
}


module.exports = {
    listChatConversations,
    saveChatConversations,
    transformRecord,
    getAllTenantConversationList,
    transformAllConversationByTenantData
};
