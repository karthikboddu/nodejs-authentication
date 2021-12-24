const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require('http-errors');
const app = express();
const crypto = require("crypto");
require('./app/helpers/init_mongodb');
require('./app/helpers/init_redis');

//require("./app/routes/turorial.routes.js")(app);
// routes

var a = require('crypto').randomBytes(64).toString('hex');



// A Node.js server
var server = require('http').Server();

// Requiring the ioredis package
var Redis = require('ioredis');
// A redis client
var redis = new Redis();
var io = require('socket.io')(server);
// Store people in chatroom
var chatters = [];

// Store messages in chatroom
var chat_messages = [];

// Subscribe to all channels which name complies with the '*' pattern
// '*' means we'll subscribe to ALL possible channels
app.get("/socket.io",(req,res)=>{


redis.psubscribe('*');

// Listen for new messages
redis.on('pmessage', function (pattern, channel, message) {
    message = JSON.parse(message);
	io.emit(""+message.data.data.user_id+message.data.data.receiver_id, message.data);
    // Just to check that things really work
    if(channel == "laravel_database_userjoined App\Events\MessageSent"){
    	io.emit('user-joined',message );
    }
    
	const mdata = message.data;
    console.log(channel, message.event,message.data,pattern);
});

});





var corsOptions = {
 origin : "*"
}

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
require("./app/routes/tutorial.routes.js")(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
const PORT = process.env.PORT || 8000;

  function encrypt(plainText, key, outputEncoding = "base64") {
      const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
      return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(outputEncoding);
  }
  
  function decrypt(cipherText, key, outputEncoding = "utf8") {
      const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
      return Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
  }

  const key = "0123456789123456";
  const plainText = "9";
  const encrypted = encrypt(plainText, key, "base64");
  console.log("Encrypted string (base64):", encrypted);
  const decrypted = decrypt(Buffer.from('RCWXbwS3fYjNGC/fnVWa7Q==', "base64"), key, "utf8")
  console.log("Decrypted string:", decrypted);


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
