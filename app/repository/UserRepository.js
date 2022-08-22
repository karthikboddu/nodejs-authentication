const db = require("../models"),
    Promise = require('bluebird')
tenant = db.tenant.tenantModel;


const findOneTenant = async (condition) => {

    return new Promise((resolve, reject) => {
        tenant.findOne(condition).populate({ path: 'user_role', select: ['name'] })
            .exec((err, user) => {
                if (err) {
                    reject({
                        err
                    })
                    return;
                } else {
                    resolve({ data: user });
                    return;
                }
            });
    })
}

const saveTenantData = async ( tenantObject) => {
    return new Promise((resolve, reject) => {
        tenantObject.save((err, t) => {
            if (err) {
                reject({
                    err
                })
                return;
            } else {
                resolve({
                    data: t
                });
                return;
            }
        })

    })
}

const findTenant = async (condition) => {

    return new Promise((resolve, reject) => {
        tenant.find(condition).populate({ path: 'user_role', select: ['name'] })
            .exec((err, user) => {
                if (err) {
                    reject({
                        err
                    })
                    return;
                } else {
                    resolve({ data: user });
                    return;
                }
            });
    })
}


module.exports = {
    findOneTenant,
    saveTenantData,
    findTenant
}
