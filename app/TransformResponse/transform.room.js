const _           = require('lodash');
const {transformBuildingDetails} = require('./transform.building');
const { transformTenantDetails } = require('./transform.tenant');

const transformTenantRoomDetails = (record) => {

    return {
        _id: record._id,
        default_no_of_persons: record.default_no_of_persons,
        status: record.status,
        tenant_id: record.tenant_id,
        contractDetails: transformTenantContractDetails(record.contractDetails[0] ? record.contractDetails[0] : {}),
        tenantLinked : record.contractDetails[0] ? true : false,
        building_floor_id: record.building_floor_id,
        room_name: record.room_name,
        room_code: record.room_code,
        created_at: record.created_at,
        updated_at: record.updated_at,
        room_amount: record.room_amount
    };
}
const transformTenantContractDetails = (record) => {

    if (Object.keys(record).length === 0)  {
        return {}
    }
    return {
        _id: record._id,
        advance_paid: record.advance_paid,
        total_amount: record.total_amount,
        balance_amount: record.balance_amount,
        status: record.status,
        tenant_id: record.tenant_id,
        floor_room_id: record.floor_room_id,
        advance_amount: record.advance_amount,
        actual_price: record.actual_price,
        price: record.price,
        no_of_persons: record.no_of_persons,
        created_at: record.created_at,
        updated_at: record.updated_at,
        parent_id: record.parent_id,
        building_floor_id: record.building_floor_id,
        building_id: record.building_id,
        orderDetails : transformTenantOrderDetails(record.orderDetails ? (record.orderDetails[0] ? record.orderDetails[0] : {}) : {}),
        tenantDetails : record.tenantDetails ? (record.tenantDetails[0] ? transformTenantDetails(record.tenantDetails[0]) : {}) : {},
        buildingDetails : record.buildingDetails[0] ? record.buildingDetails[0] : {}
    }
}

const transformTenantOrderDetails = (record) => {
    return {
        _id: record._id,
        total_amount: record.total_amount,
        room_payment_type: record.room_payment_type,
        status: record.status,
        tenant_id: record.tenant_id,
        floor_room_id: record.floor_room_id,
        actual_price: record.actual_price,
        price: record.price,
        payment_for_date: record.payment_for_date,
        created_at: record.created_at,
        updated_at: record.updated_at,
        room_contract_id: record.room_contract_id,
        payment_status: record.payment_status
    }
}
module.exports = {
    transformTenantRoomDetails,
    transformTenantContractDetails
};