const db = require("../models"),
    asset = db.tenant.asset,
    Promise = require('bluebird');

    const findOneAsset = async(condition) => {
        return new Promise((resolve, reject) => {
            asset.findOne(condition)
                .sort({$natural:-1})
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
    
    const saveAsset = async ( assetObject) => {
        return new Promise((resolve, reject) => {
            assetObject.save((err, t) => {
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

    const findAndUpdateByAssetId = async (data, assetId) => {
        return new Promise((resolve, reject) => {
            asset.findByIdAndUpdate(assetId, data, {useFindAndModify: false})
            .then(asset => {
                resolve({
                    data: asset
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
        findOneAsset,
        saveAsset,
        findAndUpdateByAssetId
    }
