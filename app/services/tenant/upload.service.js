const { generateSignedUrl, pushObjectToS3 } = require("../../common/aws");
const crypto = require('crypto');
const db = require("../../models");
const { findOneContentType } = require("../../repository/ContentTypeRepository");
const { findOneAsset, saveAsset, findAndUpdateByAssetId } = require("../../repository/AssetRepository");
const { saveUpload, findAndUpdateByUploadId } = require("../../repository/UploadRepository");
const { generatePdfWithImageAndPassword } = require("../../common/pdfkit");
const asset = db.tenant.asset;
const upload = db.tenant.upload;
const {findOneTenant} = require('../../repository/UserRepository');
const Constants = require("../../common/Constants");
const { findOneDeliveryType } = require("../../repository/DeliveryTypeRepository");
const { pushObjectToCloudinary } = require("../../common/cloudinary");
const { updateTenantDetails } = require("./tenant.service");

const uplaodAssetForTenant = async (req, parentId, tenantId, deliveryType) => {

    try {
        var now = new Date();
        const tenantData = await findOneTenant({_id: tenantId,
          start_at: {
            '$lte': now
          },
          end_at: {
            '$gte': now
          },
          status: true});

        if (!tenantData.data) {
            return ({ status: 404, message: " Tenant Not Found." })
        }   

        const s3 = req.app.get('core').init_aws_s3;

        const buf1Hash = crypto.createHash('md5').update(req.file.buffer).digest('hex');

        const assetData = await findOneAsset({ hash: buf1Hash, tenant_id: tenantId, parent_id : req.userId, is_active: true, status: Constants.UPLOAD_STATUS.COMPLETE });

        console.log(assetData, " ===assetData")

        const cdnType = process.env.CLOUDINARY == "ON" ? 'cloudinary' : 'aws';

        const uploadObject = new upload({
            tenant_id: tenantData.data._id,
            parent_id: req.userId,
            code: crypto.createHash('md5').update(Date.now.toString()).digest('hex'),
            type: cdnType,
            size: req.file.size,
            status: Constants.UPLOAD_STATUS.IN_PROGRESS,
            error_details: '',
            is_active: true
        })

        const savedUploadData = await saveUpload(uploadObject);
        if (!savedUploadData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }


        var hash = crypto.createHash('md5').update(process.env.NODE_ENV).digest('hex');

        var fileExt = req.file.originalname.split('.').pop();

        var extension = '';

        if (deliveryType.toString() == Constants.deliveryType.PROFILE_PIC) {
            extension = fileExt;
        } else if (deliveryType.toString() == Constants.deliveryType.IDENTITY) {
            extension = Constants.contentType.PDF;
        } else if (deliveryType.toString() == Constants.deliveryType.MESSAGE_ASSET) {
            extension = fileExt;
        } else {
          return ({ status: 404, message: "Delivery Type Not Found ... " })
        }

        const contentCode = (deliveryType.toString() == Constants.deliveryType.IDENTITY) ? Constants.contentType.PDF : req.file.mimetype.split('/')[0];

        const fileName = req.file.originalname.substr(0, req.file.originalname.lastIndexOf(".")) + "." +`${extension}`;

        var parentIdPath = '';

        if (req.parentId) {
            parentIdPath = req.parentId.concat("/");
        }

        var versionNumber = 1;

        if (assetData.data) {
            versionNumber = assetData.data.version + 1;
        }


        const path = hash.concat("/").concat(parentIdPath)
            .concat(req.userId).concat("/").concat(extension).concat("/").concat(versionNumber).concat("/").concat(fileName);
        console.log(path, " ===path")

        console.log(fileExt," - ", extension, " = ", fileName, " - ",contentCode)


        const pdfContentType = await findOneContentType({ code: contentCode, is_active:true });


        if (!pdfContentType.data) {
            return ({ status: 404, message: "Content Type Not Found." })
        }

        const deliveryTypeResult = await findOneDeliveryType({ code: deliveryType, is_active:true });

        if (!deliveryTypeResult.data) {
            return ({ status: 404, message: "Delivery Type Not Found." })
        }

        const assetKey = crypto.randomUUID();

        const assetObject = new asset({
            tenant_id: tenantData.data._id,
            parent_id: req.userId,
            upload_id: savedUploadData.data._id,
            name: req.file.originalname,
            code: crypto.createHash('md5').update(now.valueOf().toString()).digest('hex'),
            hash: buf1Hash,
            asset_path: path,
            asset_key: assetKey,
            version: versionNumber,
            content_type_id: pdfContentType.data._id,
            file_size: req.file.size,
            status: Constants.UPLOAD_STATUS.IN_PROGRESS,
            is_active: true,
            delivery_type_id : deliveryTypeResult.data._id
        });


        const savedAssetData = await saveAsset(assetObject);

        if (!savedAssetData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        var options = {
            userPassword: assetKey
        }

        var pdfBuffer = '';

        if (process.env.CLOUDINARY == "ON") {
            const init_cloudinary = req.app.get('core').init_cloudinary;
            var result = '';

            if (deliveryType.toString() == Constants.deliveryType.IDENTITY) {
                pdfBuffer = await generatePdfWithImageAndPassword(options, req.file.buffer);

                result = await init_cloudinary.uploader.upload("data:application/pdf;base64," + pdfBuffer.toString('base64')
                            , {
                                public_id: path,
                                resource_type: "raw"
                            });
            }  else {
                result = await pushObjectToCloudinary(init_cloudinary, req.file.buffer, path);
                console.log(result)
                if (result.secure_url) {
                    const payload = {
                        photoUrl: result.secure_url
                      }
                      console.log(payload)
                    await updateTenantDetails(req, req.userId, payload);
                }
            }
            
            if (result.secure_url) {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.COMPLETE,
                    asset_url : result.secure_url
                }
                await findAndUpdateByAssetId(updateAssetData, savedAssetData.data._id)

            } else {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.FAIL,
                    asset_url : result.secure_url
                }
                await findAndUpdateByAssetId(updateAssetData, savedAssetData.data._id)
                return ({ status: 409, message: "Couldn't Upload File to S3" })
            }                           

            console.log(result,"cloudinary")
            
        } else {
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: path, // File name you want to save as in S3
                Body: pdfBuffer
            };
            const s3Data = await pushObjectToS3(s3, params);

            if (!s3Data.result) {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.FAIL
                }
                console.log("failed")
                await findAndUpdateByUploadId(updateAssetData, savedUploadData.data._id);

                return ({ status: 409, message: "Couldn't Upload File to S3" })
            }
        }

        const updateAssetData = {
            status: Constants.UPLOAD_STATUS.COMPLETE
        }

        const existingUploadData = await findAndUpdateByUploadId(updateAssetData, savedUploadData.data._id);

        if (!existingUploadData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        return ({ status: 200, message: "Upload Success .." })
    } catch (error) {
        console.log(error,"Error")
        return ({ status: 500, message: error.message })
    }
}


const uplaodAssetTenantProfile = async (req, parentId, tenantId, deliveryType) => {

    try {
        var now = new Date();  

        const s3 = req.app.get('core').init_aws_s3;

        const buf1Hash = crypto.createHash('md5').update(req.file.buffer).digest('hex');

        const assetData = await findOneAsset({ hash: buf1Hash, tenant_id: tenantId, parent_id : req.parentId, is_active: true, status: Constants.UPLOAD_STATUS.COMPLETE });

        console.log(assetData, " ===assetData")

        const cdnType = process.env.CLOUDINARY == "ON" ? 'cloudinary' : 'aws';

        const uploadObject = new upload({
            tenant_id: req.userId,
            parent_id: req.parentId,
            code: crypto.createHash('md5').update(Date.now.toString()).digest('hex'),
            type: cdnType,
            size: req.file.size,
            status: Constants.UPLOAD_STATUS.IN_PROGRESS,
            error_details: '',
            is_active: true
        })

        const savedUploadData = await saveUpload(uploadObject);
        if (!savedUploadData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }


        var hash = crypto.createHash('md5').update(process.env.NODE_ENV).digest('hex');

        var fileExt = req.file.originalname.split('.').pop();

        var extension = '';

        if (deliveryType.toString() == Constants.deliveryType.PROFILE_PIC) {
            extension = fileExt;
        } else if (deliveryType.toString() == Constants.deliveryType.MESSAGE_ASSET) {
            extension = fileExt;
        } else {
          return ({ status: 404, message: "Delivery Type Not Found ..." })
        } 

        const contentCode = req.file.mimetype.split('/')[0];

        const fileName = req.file.originalname.substr(0, req.file.originalname.lastIndexOf(".")) + "." +`${extension}`;

        var parentIdPath = '';

        if (req.parentId) {
            parentIdPath = req.parentId.concat("/");
        }

        var versionNumber = 1;

        if (assetData.data) {
            versionNumber = assetData.data.version + 1;
        }


        const path = hash.concat("/").concat(parentIdPath)
            .concat(req.userId).concat("/").concat(extension).concat("/").concat(versionNumber).concat("/").concat(fileName);
        console.log(path, " ===path")

        console.log(fileExt," - ", extension, " = ", fileName, " - ",contentCode)


        const pdfContentType = await findOneContentType({ code: contentCode, is_active:true });


        if (!pdfContentType.data) {
            return ({ status: 404, message: "Content Type Not Found." })
        }

        const deliveryTypeResult = await findOneDeliveryType({ code: deliveryType, is_active:true });

        if (!deliveryTypeResult.data) {
            return ({ status: 404, message: "Delivery Type Not Found." })
        }

        const assetKey = crypto.randomUUID();

        const assetObject = new asset({
            tenant_id: req.userId,
            parent_id: req.parentId,
            upload_id: savedUploadData.data._id,
            name: req.file.originalname,
            code: crypto.createHash('md5').update(now.valueOf().toString()).digest('hex'),
            hash: buf1Hash,
            asset_path: path,
            asset_key: assetKey,
            version: versionNumber,
            content_type_id: pdfContentType.data._id,
            file_size: req.file.size,
            status: Constants.UPLOAD_STATUS.IN_PROGRESS,
            is_active: true,
            delivery_type_id : deliveryTypeResult.data._id
        });


        const savedAssetData = await saveAsset(assetObject);

        if (!savedAssetData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        if (process.env.CLOUDINARY == "ON") {
            const init_cloudinary = req.app.get('core').init_cloudinary;
            var result = await pushObjectToCloudinary(init_cloudinary, req.file.buffer, path);
            console.log(result)
                if (result.secure_url) {
                    const payload = {
                        photoUrl: result.secure_url
                      }
                      console.log(payload)
                    await updateTenantDetails(req, req.userId, payload);
                }

            
            if (result.secure_url) {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.COMPLETE,
                    asset_url : result.secure_url
                }
                await findAndUpdateByAssetId(updateAssetData, savedAssetData.data._id)

            } else {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.FAIL,
                    asset_url : result.secure_url
                }
                await findAndUpdateByAssetId(updateAssetData, savedAssetData.data._id)
                return ({ status: 409, message: "Couldn't Upload File to S3" })
            }                           

            console.log(result,"cloudinary")
            
        } else {
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: path, // File name you want to save as in S3
                Body: req.file.buffer
            };
            const s3Data = await pushObjectToS3(s3, params);

            if (!s3Data.result) {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.FAIL
                }
                console.log("failed")
                await findAndUpdateByUploadId(updateAssetData, savedUploadData.data._id);

                return ({ status: 409, message: "Couldn't Upload File to S3" })
            }
        }

        const updateAssetData = {
            status: Constants.UPLOAD_STATUS.COMPLETE
        }

        const existingUploadData = await findAndUpdateByUploadId(updateAssetData, savedUploadData.data._id);

        if (!existingUploadData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        return ({ status: 200, message: "Upload Success .." })
    } catch (error) {
        console.log(error,"Error")
        return ({ status: 500, message: error.message })
    }
}


module.exports = {
    uplaodAssetForTenant,
    uplaodAssetTenantProfile
}