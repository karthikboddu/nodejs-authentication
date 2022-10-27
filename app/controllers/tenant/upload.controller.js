const _ = require('lodash');
const { generateSignedUrl, pushObjectToS3 } = require('../../common/aws');
const db = require("../../models");
const { uplaodAssetForTenant, uplaodAssetTenantProfile } = require('../../services/tenant/upload.service');
const errorCode = require('../../common/errorCode');
const { findOneAsset } = require('../../repository/AssetRepository');
const Constants = require('../../common/Constants');

exports.uploadAssets = async (req, res, next) => {

  try {

    // const image = await axios
    // .get(signedUrl, {
    //     responseType: 'arraybuffer'
    // })
    // console.log(image.data);

    const tenantId = req.params.tenantId;

    const deliveryType = req.query.deliveryType;

    if (!tenantId) {
      return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    if (!req.file) {
      return res.status(404).send({ status: 404, message: "File Not Found." })
    }

    const result = await uplaodAssetForTenant(req, req.parentId, tenantId, deliveryType);

    if (result.status != 200) {
      res.api.status = result.status;
      res.api.errors = {
        message: result.message
      };
    }

    req.app.get('log').info(_.assign(req.app.get('logEntry'), {
      'status': res.api.status
    }));

    res.send(res.api);
  } catch (error) {
    console.log(error, "error")
    return res.send(error);
  }

}

exports.uploadUserAssets = async (req, res, next) => {

  try {

    const deliveryType = req.query.deliveryType;

    if (!deliveryType) {
      return res.status(404).send({ status: 404, message: "Delivery Type Not Found ... " });
    }

    if (!req.file) {
      return res.status(404).send({ status: 404, message: "File Not Found." })
    }

    const result = await uplaodAssetTenantProfile(req, req.parentId, req.userId, deliveryType);

    if (result.status != 200) {
      res.api.status = result.status;
      res.api.errors = {
        message: result.message
      };
    }

    req.app.get('log').info(_.assign(req.app.get('logEntry'), {
      'status': res.api.status
    }));

    res.send(res.api);
  } catch (error) {
    console.log(error, "error")
    return res.send(error);
  }

}

exports.getDownloadUrl = async (req, res, next) => {
  try {

    const s3 = req.app.get('core').init_aws_s3;
    console.log("Start");
    const tenantId = req.params.tenantId;

    if (!tenantId) {
      return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    const assetData = await findOneAsset({ tenant_id: tenantId, parent_id: req.userId,is_active: true, status: Constants.UPLOAD_STATUS.COMPLETE });

    if (!assetData.data) {
      return res.status(400).send({ status: 404, message: " Asset Not Found." })
    }

    console.log(assetData);
    var signedUrl = '';

    if (process.env.CLOUDINARY == "ON") {
      // const init_cloudinary = req.app.get('core').init_cloudinary;
      //signedUrl = await init_cloudinary.utils.private_download_url(assetData.data.asset_path,'pdf',{resource_type: "raw"});
      signedUrl = assetData.data.asset_url
      console.log(signedUrl)

    } else {

      signedUrl = await generateSignedUrl(s3, {
        Key: assetData.data.asset_path,
        Bucket: process.env.AWS_BUCKET,
        Expires: parseInt(process.env.AWS_S3_SIGNED_URL_EXPIRY) // S3 default is 900 seconds (15 minutes)
      });

    }



    res.api.data = {
      url: signedUrl,
      key: assetData.data.asset_key
    };
    res.send(res.api)
  } catch (error) {
    console.log(error)
    return res.send(error);
  }
}