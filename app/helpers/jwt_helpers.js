const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");

const jwtSignAccessRefreshToken = (userId) => {

    var token = jwt.sign({ id: userId }, authConfig.secret, {
      expiresIn: 3600 // 24 hours
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

const jwtSignAccessRefreshTokenTenant = (userId,userRole,fullname) => {
  //console.log(fullname,"asdasdas")
  var token = jwt.sign({ id: userId,type:userRole,name:fullname }, authConfig.secret, {
    expiresIn: 3600 // 24 hours
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
    jwtSignAccessRefreshToken,
    jwtSignAccessRefreshTokenTenant
}