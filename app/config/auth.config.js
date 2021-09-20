const { getConfigur} = require('../services/config.service')

const data =  getConfigur();
console.log(data,"s");

module.exports = {
    secret: "karthik-secret-key",
    refreshtokenkey : "karthik-refreshtoken-key",
    aesKey: "0123456789123456",
    aesIv : "ABCDEFGHJKLMNOPQRSTUVWXYZABCDEF",
    aesAlgo : "aes-256-ecb",
    googleRecaptcha : "6Ldo9NUaAAAAAON9Q0WlW72_QR76W1khFxRO2_q1",
  };
