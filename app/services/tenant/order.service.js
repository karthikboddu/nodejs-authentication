const https = require('https');
const Promise = require('bluebird');
const db = require("../../models"),
      Role = db.role,
      tenant = db.tenant.tenantModel,
      tenantRoomPayments = db.tenant.tenantRoomPayments,
      tenantRoomContract = db.tenant.tenantRoomContract,
      orderMaster = db.tenant.orderMaster;
/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('../../common/PaytmChecksum');



const generateToken = async (data) => {
    var paytmParams = {};

    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : "nikYWM52585118708761",
        "websiteName"   : "WEBSTAGING",
        "orderId"       : data.orderId,
        "callbackUrl"   : "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID="+data.orderId,
        "txnAmount"     : {
            "value"     : "1.00",
            "currency"  : "INR",
        },
        "userInfo"      : {
            "custId"    : "CUST_001",
        },
    };

    var response = "";

    return new Promise((resolve, reject) => {

    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "QQ29rwECihxHAs0Q").then(function(checksum){

            paytmParams.head = {
                "signature"    : checksum
            };
        
            var post_data = JSON.stringify(paytmParams);
        
            var options = {
        
                /* for Staging */
                hostname: 'securegw-stage.paytm.in',
        
                /* for Production */
                // hostname: 'securegw.paytm.in',
        
                port: 443,
                path: '/theia/api/v1/initiateTransaction?mid=nikYWM52585118708761&orderId='+data.orderId,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };
        
            
            var post_req = https.request(options, function(post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });
        
                post_res.on('end', function(){
                    var d = JSON.parse(response);
                    resolve({ status: 200, data: d})
                    console.log('Response: ', response);
                });
            });
            
            post_req.write(post_data);
            post_req.end();
            
        });

    })
}


const initiateRoomTransactionDetails = async (data, userId) => {
    return new Promise((resolve, reject) => {
        console.log(data)
        try {
            const tenantRoomPaymentsObject = new tenantRoomPayments (
                {
                    tenant_id : userId,
                    floor_room_id : data.roomId,
                    actual_price : data.amount,
                    price: data.amount,
                    total_amount : data.amount,
                    payment_for_date : data.paymentForDate,
                    type : data.type ? data.type : 'ROOM_RENT'
                }
            );
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            tenantRoomPayments.findOne({floor_room_id: data.roomId, tenant_id: userId, type: data.type, payment_for_date:{
                '$gte': firstDay , '$lt': lastDay
            } })
            .then(payments => {
                if (payments) {
                    reject ({ status: 404, message: 'Room Payments not found' })
                    return;
                } 
                    tenantRoomContract.findOne({floor_room_id : data.roomId, tenant_id: userId})
                    .then(roomContract => {
                        if (!roomContract) {
                            reject ({ status: 404, message: 'Room contract not found' })
                            return;
                        } else {
                            const orderMasterObject = new orderMaster({
                                tenant_id : userId,
                                room_contract_id : roomContract._id,
                                amount_paid: data.amount,
                                status: true
                            })
                            console.log(orderMasterObject)

                            tenant.findOne({ _id: userId })
                            .then(existingTenant => {
                                if (!existingTenant) {
                                    reject ({ status: 404, message: 'Tenant not found' })
                                    return;
                                } else {

                                    tenantRoomPaymentsObject.save((err,result) => {
                                        if (err) {
                                            console.log(err)
                                            reject({ status: 500, message: err })
                                            return;  
                                        }


                                        orderMasterObject.save((err,t) => {
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

module.exports = {
    generateToken,
    initiateRoomTransactionDetails
}