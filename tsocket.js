const express = require("express");
const cors = require("cors");
const app = express();

const server = require('http').createServer(app);
const io = require("socket.io")(server,{cors: {origin:"*"}});




// const socketManage = require('./socketManage')(io)
io.on('connection', (socket) => {
  
    console.log('a user connected');
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    
    socket.on('my message', (msg) => {
      console.log('message: ' + msg);
    });
  });

app.use((req, res) => {

    res.send('Hello world');
 });

const port = 8077;
server.listen(port, () => {
    console.log(`server is running at port ${port}.`);
  });