const db = require("../models"),
tenantRoomPayments = db.tenant.tenantRoomPayments,
    Promise = require('bluebird');
    const mongoose = require('mongoose');


    const saveTenantRoomPayments = async ( tenantRoomPaymentsObject) => {
        return new Promise((resolve, reject) => {
            tenantRoomPaymentsObject.save((err, t) => {
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


    const findAllRoomPaymentsByCondition = async (condition) => {

        return new Promise((resolve, reject) => {
            tenantRoomPayments.find(condition)
                .then(payments => {
                    resolve({
                        data: payments
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


    const findOneRoomPaymentsByCondition = async (condition) => {

        return new Promise((resolve, reject) => {
            tenantRoomPayments.findOne(condition)
                .then(payments => {
                    resolve({
                        data: payments
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
        saveTenantRoomPayments,
        findAllRoomPaymentsByCondition,
        findOneRoomPaymentsByCondition
    }