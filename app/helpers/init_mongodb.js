const mongoose = require('mongoose')
const mongourl = require('../config/db.config');
const db = require("../models");
const Role = db.role;

mongoose.connect(mongourl.url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(()=>{
      console.log("mongodb connected")
      initial();
  })
  .catch((err)=>console.log(err.message) )


  function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'user' to roles collection");
        });
  
        new Role({
          name: "moderator"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'moderator' to roles collection");
        });
  
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'admin' to roles collection");
        });
      }
    });
  }