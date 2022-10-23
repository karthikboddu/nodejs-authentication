const Promise = require('bluebird');


const pushObjectToS3 = async(s3, params) => {

    return new Promise((resolve, reject) => {
        try {
            s3.upload(params, function(err, data) {
                if (err) {
                    reject({
                        message:
                            "Couldn't Upload File to S3."
                    })
                    return;
                }
                resolve({
                    result: data
                });
                return;
            });  
        } catch (error) {
            reject({
                message:
                    "Couldn't Upload File to S3."
            })
        }
    })
}

const generateSignedUrl = async(s3, params) => {

    const signedUrl = s3.getSignedUrl("getObject", params);

    return signedUrl;
}

module.exports = {
    pushObjectToS3,
    generateSignedUrl
}