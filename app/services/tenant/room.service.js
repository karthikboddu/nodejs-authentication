const db = require("../../models"),
    tenantFloorRooms = db.tenant.tenantFloorRooms,
    tenantRoomContract = db.tenant.tenantRoomContract,
    tenantRoomPayments = db.tenant.tenantRoomPayments,
    orderMaster = db.tenant.orderMaster;
    
var mongoose = require('mongoose');
const { getPagination } = require("../../common/util");

const saveFloorRooms = async (data, tenantId, floorId) => {
    return new Promise((resolve, reject) => {

        try {
            const tenantFloorRoomsObject = new tenantFloorRooms(
                {
                    tenant_id: tenantId,
                    building_floor_id: floorId,
                    room_name: data.roomName,
                    room_code: data.roomCode,
                    status: true
                })

            const checkRoomCode = data.roomCode;
            tenantFloorRooms.findOne({ room_code: checkRoomCode })
                .then(existingRoom => {
                    if (existingRoom) {
                        reject({ status: 404, message: 'Tenant Room already exists' })

                    } else {
                        tenantFloorRoomsObject.save((err, t) => {
                            if (err) {
                                reject({ status: 500, message: err })
                                return;
                            }
                            resolve({
                                status: 200,
                                data: t,
                                message: "Tenant Room was registered successfully!"
                            });
                        });
                    }
                })
                .catch(err => {
                    reject({
                        status: 500,
                        message:
                            err.message || "Some error occurred while retrieving."
                    })
                });


        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }

    });
}

const listFloorRooms = async (tenantId, floorId) => {

    console.log("users")
    var userId = "61ff91da4d32cf28c89c47b3";
    tenantRoomContract.aggregate([
        {
            $lookup: {
                from: "tenant_floor_rooms",
                localField: "floor_room_id",
                foreignField: "_id",
                as: "floorRoomDetails",
            },
        },
        {
            $lookup: {
                from: "order_masters",
                localField: "_id",
                foreignField: "room_contract_id",
                as: "orderDetails"
            }
        },
        { "$unwind": "$floorRoomDetails" },
        { "$unwind": "$orderDetails" },
        {
            "$project": {
                "tenant_id": 1,
                "floor_room_id": 1,
                "advance_amount": 1,
                "actual_price": 1,
                "price:": 1,
                "no_of_persons": 1,
                "floorRoomDetails": 1,
                "orderDetails": 1
            }
        }

        // Deconstructs the array field from the
        // input document to output a document
        // for each element
    ]).exec((err, res) => {
        if (err) {
            console.log(err)
        }
        console.log(res, "res")
    })
    console.log(users, "users")

    // return new Promise((resolve, reject) => {



    //     tenantFloorRooms.find({ tenant_id: tenantId,building_floor_id:  floorId})
    //         .then(d => {
    //             resolve({ status: 200, data: d})
    //         })
    //         .catch(err => {
    //             reject({
    //                 status: 500,
    //                 message:
    //                   err.message || "Some error occurred while retrieving tutorials."
    //               })
    //           });
    // })
}


const saveTenantRoomContract = async (data, parentId, roomId, tenantId) => {
    return new Promise((resolve, reject) => {

        try {
            const tenantRoomContractObject = new tenantRoomContract(
                {
                    tenant_id: tenantId,
                    floor_room_id: roomId,
                    advance_amount: data.price * 2,
                    advance_paid: data.advancePaid,
                    actual_price: data.actualPrice,
                    price: data.price,
                    no_of_persons: data.noOfPersons,
                    total_amount: data.totalAmount,
                    balance_amount: data.balanceAmount,
                    building_id : data.buildingId,
                    building_floor_id: data.buildingFloorId,
                    parent_id : parentId,
                    status: true
                })
            const orderMasterObject = new orderMaster({
                tenant_id: tenantId,
                room_contract_id: tenantRoomContractObject._id,
                amount_paid: data.price,
                payment_status: data.paymentStatus,
                status: true
            })

            tenantRoomContract.findOne({ tenant_id: tenantId, floor_room_id: roomId, status: true })
                .then(existingRoom => {
                    if (existingRoom) {
                        reject({ status: 404, message: 'Tenant Id is already mapped to room' })

                    } else {
                        tenantRoomContractObject.save((err, t) => {
                            if (err) {
                                reject({ status: 500, message: err })
                                return;
                            }
                            orderMasterObject.save((err, t) => {
                                if (err) {
                                    reject({ status: 500, message: err })
                                    return;
                                }
                            })
                            resolve({
                                status: 200,
                                data: t,
                                message: "Tenant Room was registered successfully!"
                            });
                        });
                    }
                })
                .catch(err => {
                    reject({
                        status: 500,
                        message:
                            err.message || "Some error occurred while retrieving."
                    })
                });


        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }

    });
}

const listRoomDetails = async (tenantId, floorId) => {
    console.log("users", tenantId)
    try {
        var tid = mongoose.Types.ObjectId(tenantId);
        var fid = mongoose.Types.ObjectId(floorId);
        const result = await tenantFloorRooms.aggregate([
            {
                $match: {
                    "tenant_id": tid,
                    "building_floor_id": fid
                }
            },

            {

                $lookup: {
                    from: "tenant_room_contracts",
                    let: { "roomId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$floor_room_id", "$$roomId"] }
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
        console.log(result, "result")
        const res = { status: 200, error: "", data: result }
        return res;
        //res.json(result[0] || {})
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}

const fetchRoomDetails = async (tenantId, roomId) => {
    console.log("users", tenantId)
    try {
        var tid = mongoose.Types.ObjectId(tenantId);
        var fid = mongoose.Types.ObjectId(roomId);
        const result = await tenantFloorRooms.aggregate([
            {
                $match: {
                    "tenant_id": tid,
                    "_id": fid
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
                                    $and : [
                                        {$eq: ["$floor_room_id", "$$roomId"]},
                                        { $eq: ["$status", true] }
                            
                                    ]
                                    
                                },
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
                    _id: 0,
                }
            }
        ])
        console.log(result, "result")
        const res = { status: 200, error: "", data: result }
        return res;
        //res.json(result[0] || {})
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}


const fetchTenantRoomDetails = async (tenantId, status, limit, skip) => {
    console.log("users", tenantId)
    const paymentStatus =  status ? status.split(',') : [];

    try {
        var tid = mongoose.Types.ObjectId(tenantId);
        const result = await tenantRoomContract.aggregate([
            {
                $match: {
                    "tenant_id": tid,
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
                                    $and : [
                                        {$eq: ["$room_contract_id", "$$contractId"]},
                                        { $eq: ["$tenant_id", tid] },
                                        { $in: ["$paymeny_status", paymentStatus] }
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
                                    $and : [
                                        {$eq: ["$room_contract_id", "$$contractId"]},
                                        { $eq: ["$tenant_id", tid] },
                                        { $in: ["$paymeny_status", paymentStatus] }
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
                            $group:{
                              _id: null,
                              count: {
                                $sum: "$total_amount"
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
        console.log(result, "result") 


        const res = { status: 200, error: "", data: result[0] ? result[0] : result}
        return res;
        //res.json(result[0] || {})
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}



const unlinkTenantRoomContract = async (data, parentId, roomId, tenantId) => {
    return new Promise((resolve, reject) => {

        try {
            const saveData = {
                status: data.status,
            }
            tenantRoomContract.findByIdAndUpdate(data.contractId, saveData, { useFindAndModify: false })
            .then(result => {
              if (!result) {
                reject({ status: 404, message: "Not found!" })
              } else {


                // const orderMasterObject = new orderMaster({
                //     tenant_id: tenantId,
                //     room_contract_id: tenantRoomContractObject._id,
                //     amount_paid: data.price,
                //     payment_status: data.paymentStatus,
                //     status: true
                // })
    
                tenantRoomPayments.updateMany({ room_contract_id: data.contractId, tenant_id : tenantId},{ $set : {status:data.status}})
                    .then(existingPayments => {
                        if (existingPayments) {
                            console.log("a",existingPayments)
                            orderMaster.updateMany({ room_contract_id: data.contractId, tenant_id : tenantId}, { $set : {status:data.status}})
                            .then(existingOrders => {
                                    resolve({
                                        status: 200,
                                        data: {},
                                        error : {}
                                    });
                            })
                            .catch(err => {
                                reject({
                                    status: 500,
                                    message:
                                        err.message || "Some error occurred while retrieving."
                                })
                            });

                        } else {
                            reject({ status: 404, message: "Not found!" })
                        }
                    })
                    .catch(err => {
                        reject({
                            status: 500,
                            message:
                                err.message || "Some error occurred while retrieving."
                        })
                    });

              }})
              .catch(err => {
                reject({
                    status: 500,
                    message:
                        err.message || "Some error occurred while retrieving."
                })
            });
   


        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }

    });
}

module.exports = {
    saveFloorRooms,
    listFloorRooms,
    saveTenantRoomContract,
    listRoomDetails,
    fetchRoomDetails,
    fetchTenantRoomDetails,
    unlinkTenantRoomContract
}