const db = require("../models"),
    userConversations = db.tenant.userConversation,
    Promise = require('bluebird');
    const mongoose = require('mongoose');

const findUserConversationByFromTenantIdAndFromTenantId = (tenantId, skip, limit, toTenantId) => {


    return new Promise((resolve, reject) => {
        userConversations.find(
            {$or: [  { $and: [{ 'from_tenant_id': tenantId }, { 'to_tenant_id': toTenantId }] },  { $and: [{ 'from_tenant_id': toTenantId }, { 'to_tenant_id': tenantId }] }   ]})
        .populate({
            path: 'to_tenant_id',
            select: ['username', 'full_name', 'email', 'mobile_no', 'address', 'start_at', 'end_at', 'created_at', 'photoUrl']
        })
        .limit(limit).skip(skip).sort({ updated_at: -1 })
        .then(conversations => {
            resolve({
                data: conversations
            });
            return;

        })
        .catch(err => {
            reject({
                err
            })
            return;
        })

    })
}


const findUserConversationFromTenantIdAndFromTenantIdAgg = async(tenantId, skip, limit, toTenantId) => {
    try {
        let user1 = mongoose.Types.ObjectId(tenantId);
        let user2 = mongoose.Types.ObjectId(toTenantId);

        const result = await userConversations.aggregate([
            {
                $lookup: {
                    from: 'tenant',
                    localField: 'to_tenant_id',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                _v: 0,
                                password: 0,
                            }
                        }
                    ],
                    as: 'toObj',
                },
            },
            {
                $lookup: {
                    from: 'tenant',
                    localField: 'from_tenant_id',
                    foreignField: '_id',
                    as: 'fromObj',
                },
            },
        ])
            .match({
                $or: [
                    { $and: [{ to_tenant_id: user1 }, { from_tenant_id: user2 }] },
                    { $and: [{ to_tenant_id: user2 }, { from_tenant_id: user1 }] },
                ],
            })
            .project({
                'toObj.password': 0,
                'toObj.__v': 0,
                'fromObj.password': 0,
                'fromObj.__v': 0,
            })
            console.log(result,"result")
            return result;
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    findUserConversationByFromTenantIdAndFromTenantId,
    findUserConversationFromTenantIdAndFromTenantIdAgg
}
