const cloudinary = require('cloudinary').v2;

module.exports = (cfg, data) => {

  if (cfg.cloud.cloudinary.ENABLED == "ON") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_USER_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary Connected .... ")
    return cloudinary;
  } else {
    console.log("Cloudinary is OFF ")
  }

}
