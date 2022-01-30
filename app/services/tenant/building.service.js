const db = require("../../models"),
    tenantBuilding = db.tenant.tenantBuilding,
    tenantBuildingBlocks = db.tenant.tenantBuildingBlocks,
    Promise = require('bluebird');

const listTenantBuildings = async (req) => {
    return await tenantBuilding.find({ tenant_id: req.userId }).populate({ path: 'tenant_id', select: ['username'] });
}
const saveTenantBuildings = async (data,tenantId) => {

    return new Promise((resolve, reject) => {

        try {

            const tenantBuildingObject = new tenantBuilding({
                tenant_id: tenantId,
                building_name: data.buildingName,
                building_code: data.buildingCode,
                building_image: data.buildingImage,
                status: true,
            });

            const buildingCode = data.buildingCode;
            tenantBuilding.findOne({ building_code: buildingCode })
            .then(existingBuilding => {
                if (existingBuilding) {
                    reject ({ status: 404, message: 'TenantBuilding already exists' })
                } else {
                    tenantBuildingObject.save((err, response) => {
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

const saveTenantBuildingsBlocks = (data,tenantId,buildingId) => {

    return new Promise ((resolve, reject) => {
        try {

            const tenantBuildingBlocksObject = new tenantBuildingBlocks({
                tenant_id: tenantId,
                building_id: buildingId,
                block_name: data.blockName,
                block_code: data.blockCode,
                status: true,
            });
            console.log(data)
            const blockCode = data.blockCode;
            tenantBuildingBlocks.findOne({ block_code: blockCode })
            .then(existingBuildingBlock => {
                if (existingBuildingBlock) {
                    reject ({ status: 404, message: 'TenantBuilding Block already exists' })
                } else {
                    tenantBuildingBlocksObject.save((err, response) => {
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

const listTenantBuildingsBlocks = async (tenantId, buildingId) => {
    return await tenantBuildingBlocks.find({ tenant_id: tenantId, building_id:buildingId  }).populate({ path: 'tenant_id', select: ['username'] });
}
module.exports = {
    saveTenantBuildings,
    listTenantBuildings,
    saveTenantBuildingsBlocks,
    listTenantBuildingsBlocks
}