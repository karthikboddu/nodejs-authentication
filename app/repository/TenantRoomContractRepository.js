const db = require("../models"),
tenantRoomContract = db.tenant.tenantRoomContract,
    Promise = require('bluebird');
    const mongoose = require('mongoose');



    const findRoomContractOneByRoomId = async (condition) => {

        return new Promise((resolve, reject) => {
            tenantRoomContract.findOne(condition)
                .then(buildiing => {
                    resolve({
                        data: buildiing
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

    const saveTenantRoomContracts = async ( tenantRoomContractObject) => {
        return new Promise((resolve, reject) => {
            tenantRoomContractObject.save((err, t) => {
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


    const findAllRoomContractByCondition = async (condition) => {

        return new Promise((resolve, reject) => {
            tenantRoomContract.find(condition)
                .populate({
                    path: 'tenant_id',
                    select: ['username', 'full_name', 'email', 'mobile_no', 'address', 'start_at', 'end_at', 'created_at', 'photoUrl']
                })
                .then(buildiing => {
                    resolve({
                        data: buildiing
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
        findRoomContractOneByRoomId,
        saveTenantRoomContracts,
        findAllRoomContractByCondition
    }