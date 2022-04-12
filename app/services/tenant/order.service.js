const https = require('https');
const Promise = require('bluebird');
/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('../../common/PaytmChecksum');



const generateToken = async (res) => {
    var paytmParams = {};

    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : "nikYWM52585118708761",
        "websiteName"   : "WEBSTAGING",
        "orderId"       : "ORDERID_987651",
        "callbackUrl"   : "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=ORDERID_987651",
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
                path: '/theia/api/v1/initiateTransaction?mid=nikYWM52585118708761&orderId=ORDERID_987651',
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

module.exports = {
    generateToken
}