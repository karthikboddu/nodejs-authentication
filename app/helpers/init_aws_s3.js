const AWS = require("aws-sdk");



module.exports = (cfg, data) => {

    if (cfg.cloud.aws.ENABLED == "ON") {
        const s3 = new AWS.S3();
        s3.config.update({
            signatureVersion: 'v4',
            region: process.env.AWS_REGION
        });
        
        console.log("AWS S3 Connected.. ")
        return s3;
    } else {
        console.log("AWS S3 is OFF.");
    }
    
}


