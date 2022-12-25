const db = require("../../models"),
    tenantBuilding = db.tenant.tenantBuilding,
    tenantBuildingBlocks = db.tenant.tenantBuildingBlocks,
    tenantBuildingFloors = db.tenant.tenantBuildingFloors
    Promise = require('bluebird');
    const crypto = require('crypto');



const listFoorsByBuildingId = async (tenantId,buildingId) => {    
    return await tenantBuildingFloors.find({ tenant_id: tenantId,building_id:buildingId  });
}

const saveTenantBuildingsFloors = async (data,tenantId,buildingId,blockId) => {

    return new Promise((resolve, reject) => {

        try {
            const code = crypto.createHash('md5').update(data.floorName).digest('hex')
            const tenantBuildingFloorObject = new tenantBuildingFloors({
                tenant_id: tenantId,
                building_id: buildingId,
                block_id: blockId,
                floor_name: data.floorName,
                floor_code: code,
                no_of_rooms : data.noOfRooms,
                status: true,
            });

            const floorCode = code;
            tenantBuildingFloors.findOne({ floor_code: floorCode, building_id : buildingId, tenant_id : tenantId })
            .then(existingBuilding => {
                if (existingBuilding) {
                    reject ({ status: 404, message: 'TenantBuilding Floor already exists' })
                } else {
                    tenantBuildingFloorObject.save((err, response) => {
                        if (err) {
                            reject({ status: 500, message: err })
                            return;
                        }
                        resolve({
                            status: 200,
                            data: response,
                            message: "Tenant Building was registered successfully!"
                        });
                    });
                }
            })
            .catch(err => {
                reject({
                    status: 500,
                    message:
                      err.message || "Some error occurred while retrieving tutorials."
                  })
              });



        } catch (error) {
            reject({ status: 500, message: error })
        }

    })
}


module.exports = {
    listFoorsByBuildingId,
    saveTenantBuildingsFloors
}