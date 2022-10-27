const db = require("../models"),
    deliveryType = db.tenant.deliveryType,
    Promise = require('bluebird');


const findOneDeliveryType = async(condition) => {
    return new Promise((resolve, reject) => {
        deliveryType.findOne(condition)
            .then(type => {
                resolve({
                    data: type
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


module.exports = {
    findOneDeliveryType
}