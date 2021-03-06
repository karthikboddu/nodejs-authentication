const db = require("../../models"),
    tenantBuilding = db.tenant.tenantBuilding,
    tenantBuildingBlocks = db.tenant.tenantBuildingBlocks,
    Promise = require('bluebird');
    var mongoose = require('mongoose');

const listTenantBuildings = async (req) => {

        try {
            var tenantId = mongoose.Types.ObjectId(req.userId);

            const result = await tenantBuilding.aggregate([

                {
                    $match: {
                        $expr: {  
                            $and : [
                                { $eq: ["$tenant_id", tenantId] },
                                { $eq: ["$status", true]} 
                            ]
                        }
                    }
                },
                {
                    $sort : {'updated_at': -1}
                },
                {
    
                    $lookup: {
                        from: "tenants",
                        pipeline: [
                            {
                                $match: {
                                    $expr: { 
                                        $and : [
                                            { $eq: ["$_id", tenantId] },
                                            { $eq: ["$status", true]} 
                                        ]
                                        
                                        
                                    }
                                }
                            },
    
                            {
                                $project: {
                                    _v: 0,
                                    password: 0,

                                }
                            },

                        ],
                        as: "tenant"
                    }
                    
                },
                

            ])

            const totalAmount = await tenantBuilding.aggregate([
                {
                    $group : {
                    _id: null,
                    count: {
                      $sum: "$total_amount"
                    }
                  }
                },
            ])
            const resultData = {
                buildingsList : result,
                totalAmount : totalAmount[0] ? totalAmount[0].count : 0
            }
            
            return resultData;
            
        } catch (error) {
            console.log(error)
        }   
        
        
    //return await tenantBuilding.find({ tenant_id: req.userId, status:true}).populate({ path: 'tenant_id', select: ['username'] });
}
const saveTenantBuildings = async (data,tenantId) => {

    return new Promise((resolve, reject) => {

        try {

            const tenantBuildingObject = new tenantBuilding({
                tenant_id: tenantId,
                building_name: data.buildingName,
                building_code: data.buildingCode,
                building_image: data.buildingImage,
                building_address: data.buildingAddress,
                no_of_floors: data.noOfFloors,
                no_of_rooms: data.noOfRooms,
                total_amount: data.totalAmount,
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

const listTenantBuildingsById = async (tenantId, buildingId) => {
    return await tenantBuilding.find({ tenant_id: tenantId,_id:buildingId  }).populate({ path: 'tenant_id', select: ['username'] });
}
module.exports = {
    saveTenantBuildings,
    listTenantBuildings,
    saveTenantBuildingsBlocks,
    listTenantBuildingsBlocks,
    listTenantBuildingsById
}