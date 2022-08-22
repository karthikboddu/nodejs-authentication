const db = require("../../models"),
    tenantBuilding = db.tenant.tenantBuilding,
    tenantBuildingBlocks = db.tenant.tenantBuildingBlocks,
    tenantBuildingFloors = db.tenant.tenantBuildingFloors
    Promise = require('bluebird');



const listFoorsByBuildingId = async (tenantId,buildingId) => {    
    return await tenantBuildingFloors.find({ tenant_id: tenantId,building_id:buildingId  });
}

const saveTenantBuildingsFloors = async (data,tenantId,buildingId,blockId) => {

    return new Promise((resolve, reject) => {

        try {

            const tenantBuildingFloorObject = new tenantBuildingFloors({
                tenant_id: tenantId,
                building_id: buildingId,
                block_id: blockId,
                floor_name: data.floorName,
                floor_code: data.floorCode,
                status: true,
            });

            const floorCode = data.floorCode;
            tenantBuildingFloors.findOne({ floor_code: floorCode })
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