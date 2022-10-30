const _ = require('lodash');
const { transformTenantDetails } = require('./transform.tenant');

const { transformTenantContractDetails} = require('./transform.room');

const transformUserRecentTransaction = (record) => {

    return {
        _id: record._id,
        tenant : record.tenant_id,
        floor_room_id : record.floor_room_id,
        room_contract_id: record.room_contract_id,
        price: record.price,
        room_payment_type: record.room_payment_type,
        description: record.description,
        payment_for_date: record.payment_for_date,
        payment_status : record.payment_status,
        status: record.status,
        tenant : transformTenantRoomDetails,
        created_at: record.created_at,
        updated_at: record.updated_at,
    }
}


const transformAdminRecentTransaction = (record) => {
    return {
        _id: record._id,
        tenant_id : record.tenant_id,
        floor_room_id : record.floor_room_id,
        room_contract_id: record.room_contract_id,
        price: record.price,
        room_payment_type: record.room_payment_type,
        payment_for_date: record.payment_for_date,
        description: record.description,
        payment_status : record.payment_status,
        status: record.status,
        tenant  : transformTenantDetails(record.tenant[0] ? record.tenant[0] : {}),
        contractDetails : transformTenantContractDetails(record.contractDetails[0] ? record.contractDetails[0] : {}),
        created_at: record.created_at,
        updated_at: record.updated_at,
    }

}


module.exports = {
    transformUserRecentTransaction,
    transformAdminRecentTransaction
};
