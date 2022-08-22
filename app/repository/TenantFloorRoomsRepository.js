const db = require("../models"),
    tenantFloorRooms = db.tenant.tenantFloorRooms,
    Promise = require('bluebird');
    const mongoose = require('mongoose');



    const findOneByRoomId = async (tenantId, roomId, active) => {

        return new Promise((resolve, reject) => {
            tenantFloorRooms.findOne({ tenant_id: tenantId, _id: roomId, status: active })
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
        findOneByRoomId
    }