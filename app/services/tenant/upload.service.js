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

const uplaodAssetForTenant = async (req, parentId, tenantId) => {

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


        const fileName = req.file.originalname.substr(0, req.file.originalname.lastIndexOf(".")) + ".pdf";

        var parentIdPath = '';

        if (req.parentId) {
            parentIdPath = req.parentId.concat("/");
        }

        var versionNumber = 1;

        if (assetData.data) {
            versionNumber = assetData.data.version + 1;
        }

        const path = hash.concat("/").concat(parentIdPath)
            .concat(req.userId).concat("/pdf").concat("/").concat(versionNumber).concat("/").concat(fileName);
        console.log(path, " ===path")

        const pdfContentType = await findOneContentType({ code: "pdf" });


        if (!pdfContentType.data) {
            return ({ status: 404, message: " Content Type Not Found." })
        }

        const assetKey = crypto.randomUUID();
        console.log(now.toUTCString(),"Date.now.toString()")

        const assetObject = new asset({
            tenant_id: tenantData.data._id,
            parent_id: req.userId,
            upload_id: savedUploadData.data._id,
            name: req.file.originalname,
            code: crypto.createHash('md5').update(now.toString()).digest('hex'),
            hash: buf1Hash,
            asset_path: path,
            asset_key: assetKey,
            version: versionNumber,
            content_type_id: pdfContentType.data._id,
            file_size: req.file.size,
            status: Constants.UPLOAD_STATUS.IN_PROGRESS,
            is_active: true
        });


        const savedAssetData = await saveAsset(assetObject);

        if (!savedAssetData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        var options = {
            userPassword: assetKey
        }

        const pdfBuffer = await generatePdfWithImageAndPassword(options, req.file.buffer);

        var buf = pdfBuffer.toString('base64');
        if (process.env.CLOUDINARY == "ON") {
            const init_cloudinary = req.app.get('core').init_cloudinary;
            
            const result = await init_cloudinary.uploader.upload("data:application/pdf;base64," + buf, {
                            public_id: path,
                            resource_type: "raw"
                           });
            if (result.secure_url) {
                const updateAssetData = {
                    status: Constants.UPLOAD_STATUS.COMPLETE,
                    asset_url : result.secure_url
                }
                await findAndUpdateByAssetId(updateAssetData, savedAssetData.data._id)

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


module.exports = {
    uplaodAssetForTenant
}