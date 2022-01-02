const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");

const jwtSignAccessRefreshToken = (userId) => {

    var token = jwt.sign({ id: userId }, authConfig.secret, {
      expiresIn: 60 // 24 hours
    });
    var refreshtoken = jwt.sign({ id: userId }, authConfig.refreshtokenkey, {
      expiresIn: 604800 // 168 hours
    });

    const jToken = {
        accessToken : token,
        refreshtoken : refreshtoken
    }

    return jToken;
}

module.exports = {
    jwtSignAccessRefreshToken
}