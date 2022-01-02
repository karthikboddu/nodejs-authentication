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


// io.on('connect', function (socket) {
//     var username = socket.handshake.query.username;

//     io.emit('user-joined', { username: username });

//     socket.on('disconnect', function (socket) {
//         io.emit('user-left', { username: username });
//     });
// });
// Start the server at http://localhost:3000
server.listen(4000);

// Just to be sure it's working
console.log('Server started');
console.log( require('os').hostname()+':');
