const https = require('https');
const Promise = require('bluebird');
const db = require("../../models"),
    Role = db.role,
    tenant = db.tenant.tenantModel,
    tenantRoomPayments = db.tenant.tenantRoomPayments,
    tenantRoomContract = db.tenant.tenantRoomContract,
    orderMaster = db.tenant.orderMaster,
    tenantBuilding = db.tenant.tenantBuilding;

    var mongoose = require('mongoose');

/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('../../common/PaytmChecksum');



const generateToken = async (data, userId) => {

    var paytmParams = {};

    var response = "";

    return new Promise((resolve, reject) => {

        console.log(data.orderId)
        orderMaster.findOne({ room_payments_id: data.orderId, payment_status: "P" })
            .then(orders => {
                if (!orders) {
                    console.log("not exists")
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


const initiateRoomTransactionDetails = async (data, userId) => {
    return new Promise((resolve, reject) => {
        console.log(data)
        try {

            var date = new Date();
            const roomPaymentType = data.type ? data.type : 'ROOM_RENT';
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            console.log(firstDay, "-", lastDay)
            tenantRoomPayments.findOne({
                floor_room_id: data.roomId, tenant_id: userId, room_payment_type: roomPaymentType, payment_for_date: {
                    '$gte': firstDay, '$lt': lastDay
                }
            })
                .then(payments => {
                    if (payments) {
                        reject({ status: 404, message: 'Room Payments found' })
                        return;
                    }
                    tenantRoomContract.findOne({ floor_room_id: data.roomId, tenant_id: userId })
                        .then(roomContract => {
                            if (!roomContract) {
                                reject({ status: 404, message: 'Room contract not found' })
                                return;
                            } else {

                                const tenantRoomPaymentsObject = new tenantRoomPayments(
                                    {
                                        tenant_id: userId,
                                        floor_room_id: data.roomId,
                                        actual_price: data.amount,
                                        price: data.amount,
                                        total_amount: data.amount,
                                        payment_for_date: data.paymentForDate,
                                        room_payment_type: data.type ? data.type : 'ROOM_RENT',
                                        room_contract_id: roomContract._id
                                    }
                                );

                                const orderMasterObject = new orderMaster({
                                    tenant_id: userId,
                                    room_contract_id: roomContract._id,
                                    amount_paid: data.amount,
                                    room_payments_id: tenantRoomPaymentsObject._id,
                                    status: true
                                })
                                console.log(orderMasterObject)

                                tenant.findOne({ _id: userId })
                                    .then(existingTenant => {
                                        if (!existingTenant) {
                                            reject({ status: 404, message: 'Tenant not found' })
                                            return;
                                        } else {

                                            tenantRoomPaymentsObject.save((err, result) => {
                                                if (err) {
                                                    console.log(err)
                                                    reject({ status: 500, message: err })
                                                    return;
                                                }


                                                orderMasterObject.save((err, t) => {
                                                    if (err) {
                                                        console.log(err)
                                                        reject({ status: 500, message: err })
                                                        return;
                                                    }
                                                    resolve({
                                                        status: 200,
                                                        data: t,
                                                        message: "Tenant Room intiated payment successfully!"
                                                    });
                                                });

                                            })


                                        }
                                    })
                                    .catch(err => {
                                        reject({
                                            status: 500,
                                            message:
                                                err.message || "Some error occurred while retrieving tutorials."
                                        })
                                    });


                            }
                        })
                        .catch(err => {
                            console.log(err)
                            reject({
                                status: 500,
                                message:
                                    err.message || "Some error occurred while retrieving tutorials."
                            })
                        });

                })
                .catch(err => {
                    console.log(err)
                    reject({
                        status: 500,
                        message:
                            err.message || "Some error occurred while retrieving tutorials."
                    })
                });

        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }

    });
}

const updateOrderDetails = async (data, userId) => {
    return new Promise((resolve, reject) => {
        const orderStatus = data.status;
        const saveData = {
            payment_status: data.status,
            payment_response : data.paymentResponse ? data.paymentResponse : ''
        }
        orderMaster.findByIdAndUpdate(data.orderId, saveData, { useFindAndModify: false })
        .then(orderData => {
          if (!orderData) {
            reject({ status: 404, message: "Not found!" })
          } else {
              console.log("updated ")

              if(orderData.room_payments_id) {
                const savePaymentData = {
                    paymeny_status: orderStatus
                }
                tenantRoomPayments.findByIdAndUpdate(orderData.room_payments_id, savePaymentData, { useFindAndModify: false })
                .then(res => {
                    const buildingData = {
                        total_amount : data.buildingAmount + data.amount
                    }
                    console.log(buildingData)
                    tenantBuilding.findByIdAndUpdate(data.buildingId, buildingData, {useFindAndModify: false})
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
    console.log("users", limit, "-",skip)
    const paymentStatus =  status ? status.split(',') : [];
    return new Promise((resolve, reject) => {
    try {

            tenantRoomPayments.find({ tenant_id: tenantId}).limit(limit).skip(skip).sort({updated_at: -1})
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


           

        // const res = { status: 200, error: "", data: result[0] ? result[0] : result}
        // return res;
        //res.json(result[0] || {})
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




const fetchRecentAllTenantRoomOrderDetails = async (tenantId, status, limit, skip, startDate, endDate) => {

    
        try {

            var tid = tenantId;
            let conditions = [];
        
            const paymentStatus =  status ? status.split(',') : [];
        
            if (startDate && endDate) {
                let startDate1 = new Date(new Date(startDate).toISOString(0, 0, 0, 0)); 
                conditions.push({ $gte: [ "$created_at", startDate1] });
            }

            if (endDate) {
                let endDate1 = new Date(new Date(endDate).toISOString(23, 59, 59, 999));
                conditions.push({ $lt: [ "$created_at",  endDate1] });
            }
        
            if (status) {
                conditions.push({  $in: ["$paymeny_status", paymentStatus]  });
            }
            console.log(conditions)
        
            let final_condition = conditions.length ? conditions : [];

            const result = await tenantRoomPayments.aggregate([
                {
                    $match: {
                        $expr: {  
                            $and : final_condition
                        }
                    }
                },
                {
                    $sort : {'updated_at': -1}
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
                                        $and : [
                                            { $eq: ["$_id", "$$tenantId"] },
                                            { $eq: ["$parent_id", tid]} 
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
                        as: "tenant"
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

module.exports = {
    generateToken,
    initiateRoomTransactionDetails,
    updateOrderDetails,
    fetchTenantRoomOrderDetails,
    fetchRecentAllTenantRoomOrderDetails
}