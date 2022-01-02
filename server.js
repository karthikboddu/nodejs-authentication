const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require('http-errors');
const app = express();
require('dotenv').config()
const crypto = require("crypto");
const config = require('./app/config')
const helpers = require('./app/helpers');
const routes = require('./app/routes')
const services = require('./app/services')
var a = require('crypto').randomBytes(64).toString('hex');

var corsOptions = {
 origin : "*"
}

// set config
app.set('config', config);
app.set('core', helpers(config));

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }))

app.get("/",(req,res)=>{
 res.json({message: "welcome to sample" });
});

app.post("/signup",(req,res)=>{
  console.log(req.body)
 res.json({message: "welcome to sample" });
});

app.set('routes', routes(app));
//app.set('services', services(config));

const PORT = process.env.PORT || 8000;

  // function encrypt(plainText, key, outputEncoding = "base64") {
  //     const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
  //     return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(outputEncoding);
  // }
  
  // function decrypt(cipherText, key, outputEncoding = "utf8") {
  //     const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
  //     return Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
  // }

  // const key = "0123456789123456";
  // const plainText = "9";
  // const encrypted = encrypt(plainText, key, "base64");
  // console.log("Encrypted string (base64):", encrypted);
  // const decrypted = decrypt(Buffer.from('RCWXbwS3fYjNGC/fnVWa7Q==', "base64"), key, "utf8")
  // console.log("Decrypted string:", decrypted);


app.use(async(req,res,next)=>{
  next(createError.NotFound());
})

app.use((err,req,res,next)=>{
  res.status(err.status || 500)
  res.send({
    error :{
      status:err.status || 500,
      message : err.message,
    },
  })

})

app.listen(PORT, ()=>{
 console.log(`server is running at port ${PORT}.` );
});
