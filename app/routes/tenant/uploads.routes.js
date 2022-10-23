const controller = require('../../controllers/tenant/upload.controller'),
      {authJwt} = require('../../middlewares')

const multer = require('multer');
const storage = multer.memoryStorage({
  destination: function(req, file, callback) {
      callback(null, '');
  }
});
var multerS3 = require('multer-s3')
const AWS = require("aws-sdk");

const {createReadStream, createWriteStream} = require('fs');
const {pipeline} = require('stream/promises');
const {randomBytes, createCipheriv, createDecipheriv} = require('crypto');
const fs = require('fs');
const key = randomBytes(32); // ... replace with your key
const iv = randomBytes(16); // ... replace with your initialization vector
const fileFilter = (req, file, cb) => {
    console.log(file,"file.fieldname");
    req.fileName = file.originalname;
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb('invalid image file!', false);
    }
  };
const uploads = multer({ storage, fileFilter });



module.exports = function(app) {

    app.use(async function(req, res, next) {

      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    }); 
    const s3 = new AWS.S3();

    // pipeline(
    //   createReadStream('/home/karthik/Documents/prep.txt'),
    //   createCipheriv('aes-256-cbc', key, iv),
    //   createWriteStream('/home/karthik/Documents/prep.txt.enc')
    // )
    // .then(() => {})
    // .catch(err => {console.log(err,"meee")});
    // const cipher = createCipheriv('aes-256-cbc', key, iv);
    // const decipher = createDecipheriv('aes-256-cbc', key, iv);
    // pipeline(
    //   createReadStream('/home/karthik/Documents/prep.txt.enc'),
    //   createDecipheriv('aes-256-cbc', key, iv),
    //   createWriteStream('/home/karthik/Documents/prep_dec.txt')
    // )
    // .then((res) => {console.log(res)})
    // .catch(err => {console.log(err,"weee")});

    // decipher.setAutoPadding(false);
    // var input = fs.createReadStream('/home/karthik/Documents/prep.txt.enc');
    // var output = fs.createWriteStream('/home/karthik/Documents/prep_dec.txt');

    // input.pipe(decipher).pipe(output);

    // output.on('finish', function () {
    //     console.log('Decrypted file written to disk!');
    // });
    // output.on('error', function (e) {
    //     console.log(e);
    //  });

    var upload = multer({
      storage: multerS3({
          s3: s3,
          bucket: process.env.AWS_BUCKET,
          metadata: function (req, file, cb) {
              req.fileName = file.originalname;
              console.log(file,"file.fieldname");
              cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
              cb(null, file.originalname)
          }
      })
    })


    app.post("/api/upload/assets/:tenantId", [authJwt.verifyToken,authJwt.isAdmin,uploads.single('photos')],controller.uploadAssets);
    app.get("/api/upload/url/:tenantId", [authJwt.verifyToken,authJwt.isAdmin],controller.getDownloadUrl);

    
}