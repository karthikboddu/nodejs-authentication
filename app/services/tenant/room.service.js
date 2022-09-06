const db = require("../../models"),
    tenant = db.tenant.tenantModel,
    tenantFloorRooms = db.tenant.tenantFloorRooms,
    tenantRoomContract = db.tenant.tenantRoomContract,
    tenantBuilding = db.tenant.tenantBuilding,
    tenantRoomPayments = db.tenant.tenantRoomPayments,
    orderMaster = db.tenant.orderMaster;
    const _           = require('lodash');

var mongoose = require('mongoose');
const { findOneByTenantIdBuildingIdAndActive, findAndUpdateByBuildingId } = require("../../repository/TenantBuildingRepository");
const { findOneByRoomId, listTenantFloorRoomDetails, fetchTenantRoomDetailsByRoomId, fetchTenantRoomContractDetails } = require("../../repository/TenantFloorRoomsRepository");
const { findRoomContractOneByRoomId, saveTenantRoomContracts } = require("../../repository/TenantRoomContractRepository");
const { saveTenantRoomPayments } = require("../../repository/TenantRoomPaymentsRepository");
const { transformTenantRoomDetails } = require("../../TransformResponse/transform.room");

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
    console.log(tenantId)
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

    ]).exec((err, res) => {
        if (err) {
            console.log(err)
        }
        console.log(res, "res")
    })

}


const saveTenantRoomContract = async (data, parentId, roomId, tenantId) => {
    // const session = mongoose.startSession();
    try {
        // session.startTransaction();
        const buildingDetails = await findOneByTenantIdBuildingIdAndActive(parentId, data.buildingId, true);
        if (!buildingDetails.data) {
            return ({ status: 404, message: 'Building Not Found.' })
        }
        const floorRoomsDetails = await findOneByRoomId(parentId, roomId, true);
        if (!floorRoomsDetails.data) {
            return ({ status: 404, message: 'Floor Rooms Not Found.' })
        }
        const tenantRoomContractObject = new tenantRoomContract(
            {
                tenant_id: tenantId,
                floor_room_id: roomId,
                advance_amount: floorRoomsDetails.data.room_amount,
                advance_paid: data.advancePaid,
                price: floorRoomsDetails.data.room_amount,
                no_of_persons: data.noOfPersons,
                total_amount: data.totalAmount,
                building_id: data.buildingId,
                building_floor_id: data.buildingFloorId,
                parent_id: parentId,
                status: true
            })
            
        const roomContractDetails = await findRoomContractOneByRoomId({ floor_room_id: roomId, status: true });

        if (roomContractDetails.data) {
            return ({ status: 404, message: 'Floor Rooms is not empty.' })
        }

        const savedTenantRoomContract = await saveTenantRoomContracts(tenantRoomContractObject);

        if (!savedTenantRoomContract.data) {
            return ({ status: 500, message: 'Oops ... Something went wrong ....'  })
        }


        const tenantRoomPaymentsObject = new tenantRoomPayments(
            {
                tenant_id: tenantId,
                floor_room_id: roomId,
                price: data.price,
                payment_for_date: new Date(),
                room_payment_type: 'ROOM_RENT',
                room_contract_id: savedTenantRoomContract.data._id,
                payment_status: "C",
                description : data.description ? data.description : ''
            }
        );

        const savedTenantRoomPaymentC = await saveTenantRoomPayments(tenantRoomPaymentsObject);

        if (!savedTenantRoomPaymentC.data) {
            return ({ status: 500, message: 'Oops ... Something went wrong ....'  })
        }


        const tenantRoomPaymentsObject1 = new tenantRoomPayments(
            {
                tenant_id: tenantId,
                floor_room_id: roomId,
                price: floorRoomsDetails.data.room_amount - data.price,
                payment_for_date: new Date(),
                room_payment_type: 'BALANCE_AMOUNT',
                room_contract_id: savedTenantRoomContract.data._id,
                description : data.description ? data.description : ''
            }
        );


        const savedTenantRoomPaymentP = await saveTenantRoomPayments(tenantRoomPaymentsObject1);

        if (!savedTenantRoomPaymentP.data) {
            return ({ status: 500, message: 'Oops ... Something went wrong ....'  })
        }

        const buildingData = {
            total_amount: buildingDetails.data.total_amount + parseInt(data.price)
        }

        const resultBuilding = await findAndUpdateByBuildingId( buildingData, data.buildingId);
        if (!resultBuilding.data) {
            return ({ status: 500, message: 'Oops ... Something went wrong ....' })
        }

        // await session.commitTransaction();
        // session.endSession();
        // mongoose.close();

        return ({ status: 200, data : savedTenantRoomPaymentP.data});
    } catch (error) {
        // await session.abortTransaction();
        // session.endSession();
        // mongoose.close();
        console.log(error)
        return ({ status: 500, message: error })
    }
}

/**
 * To List the rooms by floor Id.
 * @param {*} tenantId 
 * @param {*} floorId 
 * @returns 
 */
const listRoomDetails = async (tenantId, floorId) => {

    try {
        var tid = mongoose.Types.ObjectId(tenantId);
        var fid = mongoose.Types.ObjectId(floorId);
        const result = await listTenantFloorRoomDetails(tid, fid)

        const res = { status: 200, error: "", data: result }
        return res;
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}

/**
 * To Fetch the room details by roomId or roomPaymentId
 * @param {*} tenantId 
 * @param {*} roomId 
 * @param {*} roomPaymentId 
 * @returns 
 */
const fetchRoomDetails = async (tenantId, roomId, roomPaymentId) => {

    try {
        var tid = mongoose.Types.ObjectId(tenantId);
        var rid = mongoose.Types.ObjectId(roomId);

        var conditions = {};
        if (roomPaymentId) {
            var paymentId = mongoose.Types.ObjectId(roomPaymentId);
            conditions = { $eq: ["$_id", paymentId] }
        } else {
            conditions = { $eq: ["$room_contract_id", "$$contractId"] };
        }
        console.log(conditions, "conditions");

        const result = await fetchTenantRoomDetailsByRoomId(tid, rid, conditions)
        const tranformedData = _.map(result, (record) => transformTenantRoomDetails(record));
        
        const res = { status: 200, error: "", data: tranformedData }
        return res;
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}

/**
 * fetch Tenant Room Contract Details
 * @param {*} tenantId 
 * @param {*} status 
 * @param {*} limit 
 * @param {*} skip 
 * @returns 
 */
const fetchTenantRoomDetails = async (tenantId, status, limit, skip) => {

    const paymentStatus = status ? status.split(',') : [];

    try {
        var tid = mongoose.Types.ObjectId(tenantId);
      
        const result = await fetchTenantRoomContractDetails(tid, paymentStatus, limit ,skip);

        const res = { status: 200, error: "", data: result[0] ? result[0] : result }
        return res;
    } catch (error) {
        console.log(error, "Eror")
        const res = { status: 500, error: error.message, data: "" }
        return res;
    }
}



const unlinkTenantRoomContract = async (data, parentId) => {
    return new Promise((resolve, reject) => {

        try {
            const saveData = {
                status: data.status,
            }
            tenant.findByIdAndUpdate(data.tenantId, saveData, { useFindAndModify: false })
                .then(tenantResult => {
                    if (!tenantResult) {
                        reject({ status: 404, message: "Not found!" })
                    } else {

                        tenantRoomContract.findByIdAndUpdate(data.contractId, saveData, { useFindAndModify: false })
                            .then(result => {
                                if (!result) {
                                    reject({ status: 404, message: "Not found!" })
                                } else {

                                    resolve({
                                        status: 200,
                                        data: {},
                                        error: {}
                                    });
                                    // const orderMasterObject = new orderMaster({
                                    //     tenant_id: tenantId,
                                    //     room_contract_id: tenantRoomContractObject._id,
                                    //     amount_paid: data.price,
                                    //     payment_status: data.paymentStatus,
                                    //     status: true
                                    // })

                                    // tenantRoomPayments.updateMany({ room_contract_id: data.contractId, tenant_id : data.tenantId},{ $set : {status:data.status}})
                                    //     .then(existingPayments => {
                                    //         if (existingPayments) {
                                    //             console.log("a",existingPayments)
                                    //             orderMaster.updateMany({ room_contract_id: data.contractId, tenant_id : data.tenantId}, { $set : {status:data.status}})
                                    //             .then(existingOrders => {
                                    //                     resolve({
                                    //                         status: 200,
                                    //                         data: {},
                                    //                         error : {}
                                    //                     });
                                    //             })
                                    //             .catch(err => {
                                    //                 reject({
                                    //                     status: 500,
                                    //                     message:
                                    //                         err.message || "Some error occurred while retrieving."
                                    //                 })
                                    //             });

                                    //         } else {
                                    //             reject({ status: 404, message: "Not found!" })
                                    //         }
                                    //     })
                                    //     .catch(err => {
                                    //         reject({
                                    //             status: 500,
                                    //             message:
                                    //                 err.message || "Some error occurred while retrieving."
                                    //         })
                                    //     });

                                }
                            })
                            .catch(err => {
                                reject({
                                    status: 500,
                                    message:
                                        err.message || "Some error occurred while retrieving."
                                })
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

module.exports = {
    saveFloorRooms,
    listFloorRooms,
    saveTenantRoomContract,
    listRoomDetails,
    fetchRoomDetails,
    fetchTenantRoomDetails,
    unlinkTenantRoomContract
}