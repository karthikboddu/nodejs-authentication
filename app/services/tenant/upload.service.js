const { generateSignedUrl, pushObjectToS3 } = require("../../common/aws");
const crypto = require('crypto');
const db = require("../../models");
const { findOneContentType } = require("../../repository/ContentTypeRepository");
const { findOneAsset, saveAsset, findAndUpdateByAssetId } = require("../../repository/AssetRepository");
const { saveUpload, findAndUpdateByUploadId } = require("../../repository/UploadRepository");
const { generatePdfWithImageAndPassword } = require("../../common/pdfkit");
const asset = db.tenant.asset;
const upload = db.tenant.upload;
const contentType = db.tenant.contentType;
const tenant = db.tenant.tenantModel;
const {findOneTenant} = require('../../repository/UserRepository');

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


        const assetData = await findOneAsset({ hash: buf1Hash, tenant_id: req.userId, is_active: true });

        console.log(assetData, " ===assetData")

        const uploadObject = new upload({
            tenant_id: tenantData.data._id,
            parent_id: req.userId,
            code: crypto.createHash('md5').update(Date.now.toString()).digest('hex'),
            type: 'local',
            size: req.file.size,
            status: 'IN_PROGRESS',
            error_details: '',
            is_active: true
        })

        const savedUploadData = await saveUpload(uploadObject);
        if (!savedUploadData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        // console.log(uploadObject,"buffhash");


        var hash = crypto.createHash('md5').update(process.env.NODE_ENV).digest('hex');


        const fileName = req.file.originalname.substr(0, req.file.originalname.lastIndexOf(".")) + ".pdf";

        var parentIdPath = '';

        if (req.parentId) {
            parentIdPath = req.parentId.concat("/");
        }

        var versionNumber = 1;

        if (assetData.data) {
            console.log(versionNumber, "versiono")
            versionNumber = assetData.data.version + 1;
            console.log(versionNumber, "versiono")

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
            status: 'IN_PROGRESS',
            is_active: true
        });


        const savedAssetData = await saveAsset(assetObject);

        if (!savedAssetData.data) {
            return ({ status: 201, message: "Couldn't upload file" })
        }

        var options = {
            userPassword: assetKey
        }

        console.log(assetObject, "buffhash");
        const pdfBuffer = await generatePdfWithImageAndPassword(options, req.file.buffer);

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: path, // File name you want to save as in S3
            Body: pdfBuffer
        };

        const s3Data = await pushObjectToS3(s3, params);

        if (!s3Data.result) {
            const updateAssetData = {
                status: 'FAILED'
            }
            console.log("failed")
            const existingUploadData = await findAndUpdateByUploadId(updateAssetData, savedUploadData.data._id);

            return ({ status: 409, message: "Couldn't Upload File to S3" })
        }

        const updateAssetData = {
            status: 'COMPLETE'
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