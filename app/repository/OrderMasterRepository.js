const db = require("../models"),
orderMaster = db.tenant.orderMaster,
    Promise = require('bluebird');
    const mongoose = require('mongoose');



    const findOneOrderMasterByCondition = async (condition) => {

        return new Promise((resolve, reject) => {
            orderMaster.findOne(condition)
                .then(orders => {
                    resolve({
                        data: orders
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

    const saveOrderMasterRoomPayments = async ( orderMasterRoomPaymentsObject) => {
        return new Promise((resolve, reject) => {
            orderMasterRoomPaymentsObject.save((err, t) => {
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


    const findOrderMasterByIdAndUpdate = async (orderMasterId, saveData) => {

        return new Promise((resolve, reject) => {
            orderMaster.findByIdAndUpdate(orderMasterId, saveData, { useFindAndModify: false })
                .then(orders => {
                    resolve({
                        data: orders
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
    findOneOrderMasterByCondition,
    saveOrderMasterRoomPayments,
    findOrderMasterByIdAndUpdate
}    