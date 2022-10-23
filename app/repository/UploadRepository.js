const db = require("../models"),
    upload = db.tenant.upload,
    Promise = require('bluebird');

    const saveUpload = async ( uploadObject) => {
        return new Promise((resolve, reject) => {
            uploadObject.save((err, t) => {
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

    const findAndUpdateByUploadId = async (data, uploadId) => {
        return new Promise((resolve, reject) => {
            upload.findByIdAndUpdate(uploadId, data, {useFindAndModify: false})
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
        saveUpload,
        findAndUpdateByUploadId
    }    