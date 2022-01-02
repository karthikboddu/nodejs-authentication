'use strict';

let _   = require('lodash'),

config = {
        'appname'    : 'nodejs-express-mongodb-angular11',
        'baseurl'    : process.env.BASEURL || 'http://localhost',
        'paths'      : {},
        'env'        : process.env.NODE_ENV || 'dev',
        'api'        : {},
        'db'         : {},
        'pageSize'   : 25
    };
console.log("node env :: ",process.env.NODE_ENV);
module.exports = _.extend(config, require('./' + config.env));