'use strict';


module.exports = {
    'api': {
        'host'    : '0.0.0.0',
        'port'    : process.env.PORT || 8000,
        'logPath' : '/tmp/tenant/logs/tenant-api/api-log.logs',
        'bcrypt': {
            'rounds': 8
        }
    },
    'db': {    
        'default': {
                'driver'  : process.env.DB_DRIVER_POSTGRES,
                'database': process.env.DB_NAME_POSTGRES,
                'user'    : process.env.DB_USER_POSTGRES,
                'password': process.env.DB_PASSWORD_POSTGRES,
                'port'    : process.env.DB_PORT_POSTGRES,
                'host'    : process.env.DB_URL_POSTGRES,
            },
        'mongo': {
                'url'  : process.env.DB_MONGO_URL
        },
        'redis': {
            'url'  : process.env.REDIS_URL,
            'port'    : process.env.REDIS_PORT,
            'host'    : process.env.REDIS_HOST,
        }
            
    },
    'configs': {
        'secret': process.env.JWT_SECRET_KEY,
        'refreshtokenkey' : process.env.JWT_REFRESH_TOKEN_KEY,
        'aesKey': process.env.AES_KEY,
        'aesIv' : process.env.AES_IV,
        'aesAlgo' : process.env.AES_ALGO,
        'googleRecaptcha' : process.env.GOOGLE_RECAPTCHA_KEY
    }
        
};