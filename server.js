const express = require("express");
const requestID = require("express-ruid");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require('http-errors');
const app = express();
require('dotenv').config()
const crypto = require("crypto");
const config = require('./app/config')
const helpers = require('./app/helpers');
const routes = require('./app/routes')
const services = require('./app/services');

const _ = require('lodash');
const { logger } = require("./app/helpers/init_logger");
var a = require('crypto').randomBytes(64).toString('hex');

var corsOptions = {
  origin: "*"
}

// set config
app.set('config', config);


app.set('core', helpers(config));
app.set('log', logger)

app.use(requestID())

// Log common fields
app.use(function (req, res, next) {
  res.api = {
    'status': 200,
    'errors': {},
    'data': [],
  };
  req.app.set('logEntry', {
    'serviceName': 'tenant-api',
    'method': req.method,
    'request': req.originalUrl,
    'query': req.query,
    'protocol': req.protocol,
    'tenantId': req.header('id'),
    'ip': req.ip,
    'requestId': req.rid,
  });

  next();
});


app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.json({ message: "welcome to sample" , requestId: req.rid});
});


app.set('routes', routes(app));

//app.set('services', services(config));

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


app.use(async (req, res, next) => {
  // next(createError.NotFound());
  res.api.status = 404;
  res.status(res.api.status);
  req.app.get('log').warn(_.assignIn(req.app.get('logEntry'), {
    'message': 'API endpoint does not exist',
    'status': res.api.status
  }));

  res.json(res.api);

})


// handle errors
app.use(function (err, req, res, next) {
  if (!err) {
    return next();
  }

  // catch invalid json in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {

    res.api.status = 400;
    res.status(res.api.status);

    // setting appropriate error objects
    res.api.errors.code = 'body';
    res.api.errors.message = 'Invalid input';

    req.app.get('log').warn(_.assignIn(req.app.get('logEntry'), {
      'message': 'Invalid input',
      'status': res.api.status,
      'error': err,
      'stack': err.stack,
    }));

    return res.json(res.api);
  }

  // setting appropriate error objects
  res.api.errors.code = 'endpoint';
  res.api.errors.message = 'Oops something broke!';

  res.api.status = 500;
  res.status(res.api.status);

  req.app.get('log').error(_.assignIn(req.app.get('logEntry'), {
    'message': 'Internal server error',
    'status': res.api.status,
    'error': err,
    'stack': err.stack,
  }));

  res.json(res.api);
});





app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })

})

app.listen(app.get('config').api.port, () => {
  console.log(`server is running at port ${app.get('config').api.port}.`);
});



logger.info(
  'Listening on server : ' + `${app.get('config').api.host}` + ' - port :  ' + app.get('config').api.port
);
