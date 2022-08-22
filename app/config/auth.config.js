const { getConfigur} = require('../services/config.service')

//const data =  getConfigur();
//console.log(data,"s");

module.exports = {
    secret: process.env.JWT_SECRET_KEY,
    refreshtokenkey : process.env.JWT_REFRESH_TOKEN_KEY,
    jwtExpiry : process.env.JWT_EXPIRY,
    jwtRefreshExpiry : process.env.JWT_REFRESH_EXPIRY,
    aesKey: process.env.AES_KEY,
    aesIv : process.env.AES_IV,
    aesAlgo : process.env.AES_ALGO,
    googleRecaptcha : process.env.GOOGLE_RECAPTCHA_KEY
  };
