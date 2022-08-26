const https = require('https');
const Promise = require('bluebird');
const db = require("../../models"),
    tenantRoomPayments = db.tenant.tenantRoomPayments,
    orderMaster = db.tenant.orderMaster,
    tenantBuilding = db.tenant.tenantBuilding;
const _ = require('lodash');
var mongoose = require('mongoose');
/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('../../common/PaytmChecksum');
const { findTenant, findOneTenant } = require('../../repository/UserRepository');
const { findAllRoomPaymentsByCondition, findOneRoomPaymentsByCondition } = require('../../repository/TenantRoomPaymentsRepository');
const { findAllRoomContractByCondition, findRoomContractOneByRoomId } = require('../../repository/TenantRoomContractRepository');
const moment = require('moment');



const generateToken = async (data, userId) => {

    var paytmParams = {};

    var response = "";

    return new Promise((resolve, reject) => {

        console.log(data.orderId)
        orderMaster.findOne({ room_payments_id: data.orderId, payment_status: "P" })
            .then(orders => {
                if (!orders) {

                    const orderMasterObject = new orderMaster({
                        tenant_id: userId,
                        room_contract_id: data.roomContractId,
                        amount_paid: data.amt,
                        room_payments_id: data.orderId,
                        status: true
                    })
                    console.log(orderMasterObject)
                    orderMasterObject.save((err, t) => {
                        if (err) {
                            console.log(err)
                            reject({ status: 500, message: err })
                            return;
                        }

                        paytmParams.body = {
                            "requestType": "Payment",
                            "mid": "nikYWM52585118708761",
                            "websiteName": "WEBSTAGING",
                            "orderId": t._id,
                            "callbackUrl": "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + t._id,
                            "txnAmount": {
                                "value": data.amt,
                                "currency": "INR",
                            },
                            "userInfo": {
                                "custId": "CUST_001",
                            },
                        };

                        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "QQ29rwECihxHAs0Q").then(function (checksum) {
                            paytmParams.head = {
                                "signature": checksum
                            };

                            var post_data = JSON.stringify(paytmParams);

                            var options = {

                                /* for Staging */
                                hostname: 'securegw-stage.paytm.in',

                                /* for Production */
                                // hostname: 'securegw.paytm.in',

                                port: 443,
                                path: '/theia/api/v1/initiateTransaction?mid=nikYWM52585118708761&orderId=' + t._id,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': post_data.length
                                }
                            };


                            var post_req = https.request(options, function (post_res) {
                                post_res.on('data', function (chunk) {
                                    response += chunk;
                                });

                                post_res.on('end', function () {

                                    var d = JSON.parse(response);
                                    d.orderId = t._id;
                                    d.buildingId = data.buildingId;
                                    d.buildingAmount = data.buildingAmount;
                                    resolve({ status: 200, data: d })
                                    console.log('Response: ', response);
                                });
                            });

                            post_req.write(post_data);
                            post_req.end();
                        });

                    });

                    return;
                } else {
                    paytmParams.body = {
                        "requestType": "Payment",
                        "mid": "nikYWM52585118708761",
                        "websiteName": "WEBSTAGING",
                        "orderId": orders._id,
                        "callbackUrl": "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + orders._id,
                        "txnAmount": {
                            "value": data.amt,
                            "currency": "INR",
                        },
                        "userInfo": {
                            "custId": "CUST_001",
                        },
                    };

                    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "QQ29rwECihxHAs0Q").then(function (checksum) {
                        paytmParams.head = {
                            "signature": checksum
                        };
                        var post_data = JSON.stringify(paytmParams);

                        var options = {

                            /* for Staging */
                            hostname: 'securegw-stage.paytm.in',

                            /* for Production */
                            // hostname: 'securegw.paytm.in',

                            port: 443,
                            path: '/theia/api/v1/initiateTransaction?mid=nikYWM52585118708761&orderId=' + orders._id,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': post_data.length
                            }
                        };


                        var post_req = https.request(options, function (post_res) {
                            post_res.on('data', function (chunk) {
                                response += chunk;
                            });

                            post_res.on('end', function () {

                                var d = JSON.parse(response);
                                d.orderId = orders._id;
                                d.buildingId = data.buildingId;
                                d.buildingAmount = data.buildingAmount;
                                resolve({ status: 200, data: d })
                                console.log('Response: ', response);
                            });
                        });

                        post_req.write(post_data);
                        post_req.end();
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
    })
}



function buildDates(startDate, endDate) {
    var dateArray = [];
    // var currentDate = moment(startDate);
    // var stopDate = moment(endDate);
    var currentDate = startDate;
    var stopDate = endDate;

    while (currentDate <= stopDate) {
        // dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
        //currentDate = moment(currentDate).add(1, 'month');
        dateArray.push(currentDate);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() , currentDate.getDate() + 30,  currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());

    }
    if (currentDate >= stopDate) {
        dateArray.push(currentDate);
    }

    return dateArray;
}


const initiateBulkRoomTransactionDetails = async (userId, parentId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const now = Date.now();
        const tenantList = await findTenant(
            {
                parent_id: userId,
                status: true,
                start_at: {
                    '$lte': now
                },
                end_at: {
                    '$gte': now
                }
            });

        const tenantIds = _.map(tenantList.data, (record) => record._id)
        const opts = {session , new : true};

        const roomContractsList = await findAllRoomContractByCondition({ tenant_id: { $in: tenantIds }, parent_id: userId, status: true });
        const tenantRoomIds = _.map(roomContractsList.data, (record) => record.floor_room_id);

        const roomPaymentsList = await findAllRoomPaymentsByCondition({
            floor_room_id: { $in: tenantRoomIds },
            tenant_id: { $in: tenantIds },
            status: true
        });

        if (!roomPaymentsList.data) {
            return ({ status: 200, data: {}, message: "Bulk Room Payments Completed" })
        }

        if (!roomContractsList.data) {
            return ({ status: 200, data: {}, message: "Bulk Room Payments Completed" })
        }

        const grouped = _.groupBy(roomPaymentsList.data, car => car.tenant_id);

        const roomPaymentsToBeCreatedList = [];
        const orderMasterRoomPaymentsToBeCreatedList = [];


        roomContractsList.data.forEach(element => {

            // console.log(" ------- tenantId ----", element.tenant_id._id);

            const startDate = new Date(element.tenant_id.start_at);

            const now = new Date();
            const tenantPayments = grouped[element.tenant_id._id];
            let tenantPaymentsRentType = _.filter(tenantPayments,
                { 'room_payment_type': 'ROOM_RENT' }
            );

            const datesList = buildDates(startDate, now);
            // console.log(element.tenant_id._id, "  --- " ,datesList,"--- datesList--- ");
            const paymentToBeCreated = [];

            datesList.forEach(function (item, index) {
                var found = 0;
                tenantPaymentsRentType.forEach(p => {
                    // console.log("Current: " + item);

                    // const paymentDate = moment(p.payment_for_date).format('YYYY-MM-DD')
                    const paymentDate = p.payment_for_date
                    // if (index > 0) {
                    //     console.log("Previous: " + datesList[index - 1] + " ---  " , p.payment_for_date );
                    // }
                    if (index < datesList.length - 1) {
                        //console.log("Next: " + datesList[index + 1] + " ---  ", paymentDate);
                    } else {
                        found++;
                    }
                    // if (p.tenant_id == '621b5883038d7f00166823d7') {
                    //     console.log(paymentDate, " - >= - ", item, " - -  ", paymentDate , " - <= -  ", datesList[index + 1], "   ",paymentDate >= item && paymentDate <= datesList[index + 1] );
                    // }
                    if (paymentDate >= item && paymentDate <= datesList[index + 1] && index < datesList.length - 1) {
                        // console.log(" == Found ", paymentDate);
                        found++;
                    }
                });


                if (found <= 0) {

                    const tenantRoomPaymentsObject = new tenantRoomPayments(
                        {
                            tenant_id: element.tenant_id._id,
                            floor_room_id: element.floor_room_id,
                            actual_price: element.price,
                            price: element.price,
                            total_amount: element.price,
                            payment_for_date: new Date(item),
                            room_payment_type: 'ROOM_RENT',
                            room_contract_id: element._id
                        }
                    );
                    roomPaymentsToBeCreatedList.push(tenantRoomPaymentsObject);

                    const orderMasterObject = new orderMaster({
                        tenant_id: element.tenant_id._id,
                        room_contract_id: element._id,
                        amount_paid: element.price,
                        room_payments_id: tenantRoomPaymentsObject._id,
                        status: true
                    })

                    orderMasterRoomPaymentsToBeCreatedList.push(orderMasterObject);
                }
                if (tenantPaymentsRentType.length <= 0) {
                    paymentToBeCreated.push(item);
                }
                // console.log(" ================================ ");
            })
        });

        tenantRoomPayments.insertMany(roomPaymentsToBeCreatedList, opts, function (err, docs) {
            if (err) {
                return ({ status: 500, message: err })
            } else {
                console.log(docs, "Multiple documents inserted to Collection");
            }
        });

        orderMaster.insertMany(orderMasterRoomPaymentsToBeCreatedList, opts ,function (err, docs) {
            if (err) {
                return ({ status: 500, message: err })
            } else {
                console.log(docs, "Multiple documents inserted to Collection");

            }
        });
        await session.commitTransaction();
        session.endSession();
        // console.log(roomPaymentsToBeCreatedList, " ================================ ", orderMasterRoomPaymentsToBeCreatedList);
        return ({ status: 200, data: {}, message: "Bulk Room Payments Completed - " + roomPaymentsToBeCreatedList.length })
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        return ({ status: 500, message: error })
    }
}

const initiateRoomTransactionDetails = async (data, userId) => {

    console.log(data)
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const now = Date.now();
        const tenantDetails = await findOneTenant(
            {
                _id: userId,
                status: true,
                start_at: {
                    '$lte': now
                },
                end_at: {
                    '$gte': now
                }
            });

        if (!tenantDetails.data) {
            return ({ status: 404, data: {}, message: 'Tenant not found' })
        }
        var date = new Date();
        const opts = {session , new : true};

        const startDate = new Date(tenantDetails.data.start_at);

        const roomPaymentType = data.type ? data.type : 'ROOM_RENT';

        var firstDay = new Date(date.getFullYear(), date.getMonth(), startDate.getDate());
        var lastDay = new Date(date.getFullYear(), date.getMonth() , startDate.getDate() + 30);

        console.log(firstDay, "-", lastDay, ' -- ', tenantDetails.data.start_at)

        const payments = await findOneRoomPaymentsByCondition({
            floor_room_id: data.roomId,
            tenant_id: userId,
            status: true, 
            room_payment_type: roomPaymentType,
            payment_for_date: {
                '$gte': firstDay, '$lt': lastDay
            }
        });

        if (payments.data) {
            return ({ status: 404, message: 'Room Payments found' })
        }

        const roomContract = await findRoomContractOneByRoomId({ floor_room_id: data.roomId, tenant_id: userId, status: true });

        if (!roomContract.data) {
            return ({ status: 404, message: 'Room contract not found' })
        }

        const tenantRoomPaymentsObject = new tenantRoomPayments(
            {
                tenant_id: userId,
                floor_room_id: data.roomId,
                actual_price: roomContract.data.price,
                price: roomContract.data.price,
                total_amount: roomContract.data.price,
                payment_for_date: firstDay,
                room_payment_type: data.type ? data.type : 'ROOM_RENT',
                room_contract_id: roomContract.data._id,
                description : data.description ? data.description : ''
            }
        );

        const orderMasterObject = new orderMaster({
            tenant_id: userId,
            room_contract_id: roomContract.data._id,
            amount_paid: roomContract.data.price,
            room_payments_id: tenantRoomPaymentsObject._id,
            status: true
        })

        tenantRoomPaymentsObject.save((err, result) => {
            if (err) {
                console.log(err)
                return ({ status: 500, message: err })
            }
            orderMasterObject.save((err, t) => {
                if (err) {
                    console.log(err)
                    return ({ status: 500, message: err })
                }
                return ({
                    status: 200,
                    data: t,
                    message: "Tenant Room intiated payment successfully!"
                });
            });

        })
        await session.commitTransaction();
        session.endSession();
        return ({
            status: 200,
            data: {},
            message: "Tenant Room intiated payment successfully!"
        });

    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        return ({ status: 500, message: error })
    }
}

const updateOrderDetails = async (data, userId) => {
    return new Promise((resolve, reject) => {
        const orderStatus = data.status;
        const saveData = {
            payment_status: data.status,
            payment_response: data.paymentResponse ? data.paymentResponse : ''
        }
        orderMaster.findByIdAndUpdate(data.orderId, saveData, { useFindAndModify: false })
            .then(orderData => {
                if (!orderData) {
                    reject({ status: 404, message: "Not found!" })
                } else {
                    console.log("updated ")

                    if (orderData.room_payments_id) {
                        const savePaymentData = {
                            payment_status: orderStatus
                        }
                        tenantRoomPayments.findByIdAndUpdate(orderData.room_payments_id, savePaymentData, { useFindAndModify: false })
                            .then(res => {
                                const buildingData = {
                                    total_amount: data.buildingAmount + data.amount
                                }
                                console.log(buildingData)
                                tenantBuilding.findByIdAndUpdate(data.buildingId, buildingData, { useFindAndModify: false })
                                    .then(res => {
                                    })
                                    .catch(err => {
                                        console.log(err, "err")
                                        reject({ status: 500, message: err })

                                    });
                            })
                            .catch(err => {
                                console.log(err, "err")
                                reject({ status: 500, message: err })

                            });
                    }
                    resolve({
                        status: 200,
                        data: data,
                        message: "updated payment successfully!"
                    });
                }
            })
            .catch(err => {
                console.log(err, "err")
                reject({ status: 500, message: err })

            });

    });
}


const fetchTenantRoomOrderDetails = async (tenantId, status, limit, skip) => {
    console.log("users", limit, "-", skip)
    const paymentStatus = status ? status.split(',') : [];
    return new Promise((resolve, reject) => {
        try {

            tenantRoomPayments.find({ tenant_id: tenantId })
                .populate({ path: 'tenant_id', select: ['username', 'full_name', 'email', 'mobile_no', 'address', 'start_at', 'end_at', 'created_at', 'photoUrl'] })
                .limit(limit).skip(skip).sort({ updated_at: -1 })
                .then(orders => {

                    resolve({
                        status: 200,
                        data: orders
                    });
                    return;

                })
                .catch(err => {
                    reject({
                        status: 500,
                        message:
                            err.message || "Some error occurred while retrieving tutorials."
                    })
                    return;
                })

        } catch (error) {
            console.log(error)
            reject({
                status: 500,
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            })
        }
    })
}




const fetchRecentAllTenantRoomOrderDetails = async (tenantId, status, limit, skip, startDate, endDate, roomId, roomPaymentId) => {


    try {

        var tid = tenantId;

        let conditions = [];
        let tenantConditions = [];

        const paymentStatus = status ? status.split(',') : [];

        if (startDate) {
            let startDate1 = new Date(new Date(startDate).toISOString(0, 0, 0, 0));
            conditions.push({ $gte: ["$created_at", startDate1] });
        }

        if (endDate) {
            let endDate1 = new Date(new Date(endDate).toISOString(23, 59, 59, 999));
            conditions.push({ $lt: ["$created_at", endDate1] });
        }

        if (status) {
            conditions.push({ $in: ["$payment_status", paymentStatus] });
        }

        if (roomId) {
            var rUId = mongoose.Types.ObjectId(roomId);
            conditions.push({ $eq: ["$floor_room_id", rUId] });
            tenantConditions.push({ $eq: ["$_id", "$$tenantId"] });
        } else {
            tenantConditions.push({ $eq: ["$_id", "$$tenantId"] });
            tenantConditions.push({ $eq: ["$parent_id", tid] });
        }

        if (roomPaymentId) {
            var roomPaymentObjectId = mongoose.Types.ObjectId(roomPaymentId);
            conditions.push({ $eq: ["$_id", roomPaymentObjectId] });
        }
        console.log(conditions, tenantConditions)

        let final_condition = conditions.length ? conditions : [];

        const result = await tenantRoomPayments.aggregate([
            {
                $match: {
                    $expr: {
                        $and: final_condition
                    }
                }
            },
            {
                $sort: { 'updated_at': -1 }
            },
            {
                $skip: skip
            }, {
                $limit: limit
            },
            {

                $lookup: {
                    from: "tenants",
                    let: { "tenantId": "$tenant_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: tenantConditions
                                }
                            }
                        },

                        {
                            $project: {
                                _v: 0,
                                password: 0,

                            }
                        }
                    ],
                    as: "tenant"
                }
            },
            {

                $lookup: {
                    from: "tenant_room_contracts",
                    let: { "contractId": "$room_contract_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$contractId"] }
                                    ]
                                }
                            }
                        },

                        {
                            $project: {
                                _v: 0,
                                password: 0,

                            }
                        }
                    ],
                    as: "contractDetails"
                }
            },
            {

                $lookup: {
                    from: "tenant_buildings",
                    let: { "buildingId": "$building_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$buildingId"] }
                                    ]
                                }
                            }
                        },

                        {
                            $project: {
                                _v: 0,

                            }
                        }
                    ],
                    as: "buildingDetails"
                }
            },
        ])

        return result;

    } catch (error) {
        console.log(error, "Eror")
        const res = { error: error.message }
        return res;
    }

}

const saveOrderDetailsAndComplete = async (data, parentId) => {
    return new Promise((resolve, reject) => {
        const saveData = {
            payment_status: data.paymentStatus,
            updated_at: new Date()
        }
        tenantRoomPayments.findByIdAndUpdate(data.roomPaymentId, saveData, { useFindAndModify: false })
            .then(paymentData => {
                if (!paymentData) {

                    reject({ status: 404, message: "Not found!" })

                } else {

                    orderMaster.findOne({ room_payments_id: data.roomPaymentId, payment_status: "P" })
                        .then(orders => {
                            if (!orders) {
                                const orderMasterObject = new orderMaster({
                                    tenant_id: data.tenantId,
                                    room_contract_id: paymentData.room_contract_id,
                                    amount_paid: paymentData.price,
                                    room_payments_id: paymentData._id,
                                    status: true,
                                    payment_status: data.paymentStatus,
                                    payment_response: data.paymentResponse ? data.paymentResponse : '{}',
                                    payment_type: "INTERNAL"
                                })
                                orderMasterObject.save((err, t) => {
                                    if (err) {
                                        console.log(err)
                                        reject({ status: 500, message: err })
                                        return;
                                    }
                                    const buildingData = {
                                        total_amount: data.amount
                                    }
                                    tenantBuilding.findByIdAndUpdate(data.buildingId, buildingData, { useFindAndModify: false })
                                        .then(res => {
                                        })
                                        .catch(err => {
                                            console.log(err, "err")
                                            reject({ status: 500, message: err })

                                        });
                                    resolve({
                                        status: 200,
                                        data: t,
                                        message: "Tenant Room payment successfully!"
                                    });
                                });
                            } else {
                                const ordersData = {
                                    payment_status: data.paymentStatus,
                                    payment_type: "INTERNAL",
                                    payment_response: data.paymentResponse ? data.paymentResponse : '{}'
                                }
                                orderMaster.findByIdAndUpdate(orders._id, ordersData, { useFindAndModify: false })
                                    .then(paymentData => {

                                        const buildingData = {
                                            total_amount: data.amount
                                        }
                                        tenantBuilding.findByIdAndUpdate(data.buildingId, buildingData, { useFindAndModify: false })
                                            .then(res => {
                                            })
                                            .catch(err => {
                                                console.log(err, "err")
                                                reject({ status: 500, message: err })

                                            });

                                        resolve({
                                            status: 200,
                                            data: paymentData,
                                            message: "Tenant Room payment successfully!"
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err, "err")
                                        reject({ status: 500, message: err })
                                    });
                            }
                        })
                        .catch(err => {
                            console.log(err, "err")
                            reject({ status: 500, message: err })

                        });

                }
            })
            .catch(err => {
                console.log(err, "err")
                reject({ status: 500, message: err })

            });
    })
}

module.exports = {
    generateToken,
    initiateRoomTransactionDetails,
    updateOrderDetails,
    fetchTenantRoomOrderDetails,
    fetchRecentAllTenantRoomOrderDetails,
    saveOrderDetailsAndComplete,
    initiateBulkRoomTransactionDetails
}