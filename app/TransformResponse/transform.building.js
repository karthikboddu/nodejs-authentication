const _           = require('lodash');


const transformBuildingDetails = (record) => {
    return {
        _id: record._id,
        tenant_id: record.tenant_id,
        building_name: record.building_name,
        building_address: record.building_address,
        building_code: record.building_code,
        building_image: record.building_image,
        no_of_floors: record.no_of_floors,
        no_of_rooms: record.no_of_rooms,
        total_amount: record.total_amount,
        status: record.status,
        created_at: record.created_at,
        updated_at:record.updated_at
    }
}


module.exports = {
    transformBuildingDetails
}