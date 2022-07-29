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
const jwt = require('jsonwebtoken');

// const socketManage = require('./socketManage')(io)



//swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      version: "1.0.0",
      title: " Management and Authentication service",
      description: "Management and Authentication of Tenants",
      contact: {
        name: "karthikb5566@gmail.com"
      },
      servers: ["http://localhost:8000"],
    },
    basePath: '/',
    components: {
      securitySchemes: {
        "x-access-token": {
          "type": "apiKey",
          "name": "api_key",
          "in": "header"
        },
      }
    },
    security: [{
      "x-access-token": []
    }]

  },
  // ['.routes/*.js']
  apis: ["./app/swagger.yml"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const _ = require('lodash');
const { logger } = require("./app/helpers/init_logger");
const { saveChatConversations } = require("./app/services/chat/chat.service");
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

// app.get('/socket.io/', (req, res) => {

//   res.send('Hello world');
// });

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
const server = require('http').Server(app);
const io = require("socket.io")(server,{cors: {origin:"*"}});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('token', token);
  next();
});

io.use(async (socket, next) => {
  // fetch token from handshake auth sent by FE
  const token = socket.handshake.auth.token;
  try {
    // verify jwt token and get user data
    // const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log('user', user);
    // save the user data into socket object, to be used further
    socket.user = token;
    next();
  } catch (e) {
    // if token is invalid, close connection
    console.log('error', e.message);
    return next(new Error(e.message));
  }
});



io.on('connection', (socket) => {
  
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
  socket.on('my message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on("join", (roomName) => {
    console.log("join: " + roomName);
    socket.join(roomName);
  });

  socket.on('message', async({message, roomName, stoken, to, parentId  }, callback) => {
    console.log('message: ' + message + ' in ' + roomName + ' token ' + stoken + ' to ' + to);

    // generate data to send to receivers
    const outgoingMessage = {
      toTenantId : to,
      text : message,
      user : socket.user
    };
    // send socket to all in room except sender
    try {
      const result = await saveChatConversations(outgoingMessage, socket.user, parentId)
      io.emit(to, result.data);  
    } catch (error) {
      return next(error)
    }
    
    callback({
      status: "ok"
    });
    // send to all including sender
    // io.to(roomName).emit('message', message);
  })

  socket.on('typing', async({message, stoken, isTyping, to }, callback) => {
    console.log('message: ' + message + ' in ' + ' token ' + stoken + ' to ' + to + ' istyping ' + isTyping);
    const typing = isTyping;
    // generate data to send to receivers
    const outgoingMessage = {
      isTyping : typing,
      senderToken : stoken,
      receiverToken : to
    };
    // send socket to all in room except sender
    try {
      io.emit(to, outgoingMessage);  
    } catch (error) {
      return next(error)
    }
    
    callback({
      status: "ok"
    });
    // send to all including sender
    // io.to(roomName).emit('message', message);
  })


});



server.listen(app.get('config').api.port, () => {
  console.log(`server is running at port ${app.get('config').api.port}.`);
});



logger.info(
  'Listening on server : ' + `${app.get('config').api.host}` + ' - port :  ' + app.get('config').api.port
);
