const db = require("../models"),
    tenantFloorRooms = db.tenant.tenantFloorRooms,
    tenantRoomContract = db.tenant.tenantRoomContract,
    Promise = require('bluebird');



    const findOneByRoomId = async (tenantId, roomId, active) => {

        return new Promise((resolve, reject) => {
            tenantFloorRooms.findOne({ tenant_id: tenantId, _id: roomId, status: active })
                .then(buildiing => {
                    resolve({
                        data: buildiing
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


    const listTenantFloorRoomDetails = async (tenantId, floorId) => {
        const result = await tenantFloorRooms.aggregate([
            {
                $match: {
                    "tenant_id": tenantId,
                    "building_floor_id": floorId
                }
            },

            {

                $lookup: {
                    from: "tenant_room_contracts",
                    let: { "roomId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$floor_room_id", "$$roomId"] },
                                        { $eq: ["$status", true] }

                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "order_masters",
                                let: { "contractId": "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$room_contract_id", "$$contractId"] }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                        }
                                    }
                                ],
                                as: "orderDetails"
                            },
                        },

                        {
                            $project: {
                                _v: 0,
                            }
                        }
                    ],
                    as: "contractDetails"
                }
            },
            {
                $project: {
                    __v: 0,
                }
            }
        ])


        return result;
    }

    const fetchTenantRoomDetailsByRoomId = async(tenantId, roomId, conditions) => {

        const result = await tenantFloorRooms.aggregate([
            {
                $match: {
                    "tenant_id": tenantId,
                    "_id": roomId
                }
            },

            {

                $lookup: {
                    from: "tenant_room_contracts",
                    let: { "roomId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$floor_room_id", "$$roomId"] },
                                        { $eq: ["$status", true] }

                                    ]

                                },
                            }
                        },
                        {
                            $lookup: {
                                from: "tenant_room_payments",
                                let: { "contractId": "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: conditions
                                        }
                                    },
                                    {
                                        $project: {
                                            __v: 0,
                                        }
                                    },
                                    {
                                        $limit: 1
                                    }
                                ],
                                as: "orderDetails"
                            },
                        },
                        {
                            $lookup: {
                                from: "tenants",
                                let: { "tid": "$tenant_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$tid"] }
                                        }
                                    },
                                    {
                                        $project: {
                                            __v: 0,
                                            password: 0,
                                            aadhar_id: 0
                                        }
                                    },
                                    {
                                        $limit: 1
                                    }
                                ],
                                as: "tenantDetails"
                            },
                        },
                        {
                            $lookup: {
                                from: "tenant_buildings",
                                let: { "bid": "$building_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$bid"] }
                                        }
                                    },
                                    {
                                        $project: {
                                            __v: 0,
                                        }
                                    },
                                    {
                                        $limit: 1
                                    }
                                ],
                                as: "buildingDetails"
                            },
                        },

                        {
                            $project: {
                                __v: 0,
                            }
                        }
                    ],
                    as: "contractDetails"
                }
            },
            {
                $project: {
                    __v: 0,
                }
            }
        ])
        return result;
    }

    const fetchTenantRoomContractDetails = async(tenantId , paymentStatus, limit, skip) => {
        const result = await tenantRoomContract.aggregate([
            {
                $match: {
                    "tenant_id": tenantId,
                    "status": true
                }
            },
            {
                $lookup: {
                    from: "tenant_buildings",
                    let: { "bid": "$building_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$bid"] }
                            }
                        },
                        {
                            $project: {
                                __v: 0
                            }
                        }
                    ],
                    as: "buildingDetails"
                },
            },
            {
                $lookup: {
                    from: "tenant_floor_rooms",
                    let: { "fid": "$floor_room_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$fid"] }
                            }
                        },
                        {
                            $project: {
                                __v: 0
                            }
                        }
                    ],
                    as: "roomDetails"
                },
            },
            {
                $lookup: {
                    from: "tenants",
                    let: { "id": "$tenant_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$id"] }
                            }
                        },
                        {
                            $project: {
                                password: 0,
                                aadhar_id: 0
                            }
                        }
                    ],
                    as: "tenantDetails"
                },
            },

            {
                $lookup: {
                    from: "tenant_room_payments",
                    let: { "contractId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$room_contract_id", "$$contractId"] },
                                        { $eq: ["$tenant_id", tenantId] },
                                        { $in: ["$payment_status", paymentStatus] },
                                        { $in: ["$payment_status", paymentStatus] }
                                    ]

                                },
                            },
                        },


                        {
                            $skip: skip
                        }, {
                            $limit: limit
                        },
                        {
                            $project: {
                                __v: 0,
                            }
                        },
                    ],
                    as: "orderDetails"
                },
            },

            {
                $lookup: {
                    from: "tenant_room_payments",
                    let: { "contractId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$room_contract_id", "$$contractId"] },
                                        { $eq: ["$tenant_id", tenantId] },
                                        { $in: ["$payment_status", paymentStatus] }
                                    ]

                                },
                            },
                        },
                        {
                            $project: {
                                __v: 0,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: {
                                    $sum: "$price"
                                }
                            }
                        },
                    ],
                    as: "totalAmount"
                },
            },

            {
                $project: {
                    __v: 0,
                }
            },

            {
                $project: {
                    __v: 0,
                }
            }
        ])


        return result;
    }

    const updateTenantFloorRoomsByRoomId = async (roomId, data) => {
        return new Promise((resolve, reject) => {
  
            tenantFloorRooms.findByIdAndUpdate(roomId, data, { useFindAndModify: false })
            .then(res => {
                resolve({
                    data: res
                });
                return;
            })
            .catch(err => {
              console.log(err, "err")
              reject(err)
      
            });
      
        })
    }


    module.exports = {
        findOneByRoomId,
        listTenantFloorRoomDetails,
        fetchTenantRoomDetailsByRoomId,
        fetchTenantRoomContractDetails,
        updateTenantFloorRoomsByRoomId
    }