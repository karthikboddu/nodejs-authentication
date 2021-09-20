const dbConfig = require('../config/db.config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.url = dbConfig.url;
db.tutorials =  require('./tutorial.model.js')(mongoose);
db.user = require("./user.model");
db.role = require("./role.model");
db.token = require("./resetpassword.model");
db.userlogin = require('./userLogin')(mongoose);
db.configs = require('./configs.model')(mongoose);
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
