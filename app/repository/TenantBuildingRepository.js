const db = require("../models"),
    tenantBuilding = db.tenant.tenantBuilding,
    Promise = require('bluebird');
    const mongoose = require('mongoose');


    const findOneByTenantIdBuildingIdAndActive = async (tenantId, buildingId, active) => {


        return new Promise((resolve, reject) => {
            tenantBuilding.findOne({ _id: buildingId, tenant_id : tenantId, status: active})
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


    const findAndUpdateByBuildingId = async (data, buildingId) => {
        return new Promise((resolve, reject) => {
        tenantBuilding.findByIdAndUpdate(buildingId, data, {useFindAndModify: false})
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
        findOneByTenantIdBuildingIdAndActive,
        findAndUpdateByBuildingId
    }