const _ = require('lodash');


const transformTenantDetails = (record) => {

    return {
        _id: record._id,
        parent_id: record.parent_id,
        user_role: record.user_role,
        full_name: record.full_name,
        username: record.username,
        email: record.email,
        mobile_no: record.mobile_no,
        aadhar_id: record.aadhar_id,
        address: record.address,
        end_at: record.end_at,
        status: record.status,
        start_at: record.start_at,
        created_at: record.created_at,
        updated_at: record.updated_at,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    }

}

module.exports = {
    transformTenantDetails
}