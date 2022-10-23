const cloudinary = require('../../helpers/init_cloudinary');
const _ = require('lodash');
const { generateSignedUrl, pushObjectToS3 } = require('../../common/aws');
const db = require("../../models");
const { uplaodAssetForTenant } = require('../../services/tenant/upload.service');
const errorCode = require('../../common/errorCode');
const { findOneAsset } = require('../../repository/AssetRepository');
const asset = db.tenant.asset;
const upload = db.tenant.upload;
const contentType = db.tenant.contentType;

exports.uploadAssets = async (req, res, next) => {

  try {

    // const result = await cloudinary.uploader.upload(req.file.path, {
    //     public_id: `image_profile`,
    //     width: 500,
    //     height: 500,
    //     crop: 'fill',
    //     private:true
    //   });

    // const signed = cloudinary.v2.utils.private_download_url('image_profile', 'png');


    // res.api.data = {
    //   uploads :signed,
    // };

    // const image = await axios
    // .get(signedUrl, {
    //     responseType: 'arraybuffer'
    // })
    // console.log(image.data);

    const tenantId = req.params.tenantId;

    if (!tenantId) {
        return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    if (!req.file) {
      return ({ status: 404, message: " File Not Found." })
    }

    const result = await uplaodAssetForTenant(req, req.parentId, tenantId);

    // const signedParams = {
    //   Key: path,
    //   Bucket: process.env.AWS_BUCKET,
    //   Expires: parseInt(process.env.AWS_S3_SIGNED_URL_EXPIRY) // S3 default is 900 seconds (15 minutes)
    // }

    // const signedUrl = await generateSignedUrl(s3, signedParams);

    // res.api.data = {
    //   upload: result.message
    // };

    if (result.status !=200) {
      res.api.status = result.status;
      res.api.errors = {
        message : result.message
      };
    }

    req.app.get('log').info(_.assign(req.app.get('logEntry'), {
      'status': res.api.status
    }));

    res.send(res.api);
  } catch (error) {
    console.log(error,"error")
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

    const assetData = await findOneAsset({tenant_id : tenantId, parent_id : req.userId});
    if (!assetData.data) {
      return res.status(400).send({ status: 404, message: " Asset Not Found." })
    }
    console.log(assetData);

    const signedUrl = await generateSignedUrl(s3, {
      Key: assetData.data.asset_path,
      Bucket: process.env.AWS_BUCKET,
      Expires: parseInt(process.env.AWS_S3_SIGNED_URL_EXPIRY) // S3 default is 900 seconds (15 minutes)
    });


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