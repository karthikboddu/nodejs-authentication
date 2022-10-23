const db = require("../models"),
    contentType = db.tenant.contentType,
    Promise = require('bluebird');


const findOneContentType = async(condition) => {
    return new Promise((resolve, reject) => {
        contentType.findOne(condition)
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
    findOneContentType
}