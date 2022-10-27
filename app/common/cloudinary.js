const Promise = require('bluebird');


const pushObjectToCloudinary = async(cloudinary, buffer, path) => {

    return new Promise((resolve, reject) => {
        try {
            cloudinary.uploader.upload_stream({ public_id: path, resource_type: 'raw' }, (err, res) => {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(res);
                }
              }).end(buffer);
        } catch (error) {
            reject({
                message:
                    "Couldn't Upload File to cloudinary."
            })
        }
    })
}

module.exports = {
    pushObjectToCloudinary
}