const db = require("../models");
const Configuration = db.configs;
var result ='dsad';
Configuration.find({})
.then(data => {
     result = data;
})
.catch(err => {
    console.log(err)
});

exports.storageConfig =  result;