const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const Promise = require('bluebird');

// validateJwt = (req, res, next) => {

//     let token = req.headers["x-access-token"];
//     if (!token) {
//       res.api.status = 403;
//       res.status(res.api.status);
  
//       res.api.errors = {};
  
//       // setting appropriate error objects
//       res.api.errors.code = 'UNAUTHENTICATED';
//       res.api.errors.message = 'No token provided!';
//       return res.send(res.api);
//     }
  
//     jwt.verify(token, config.secret, (err, decoded) => {
//       if (err) {
//         res.api.status = 401;
//         res.status(res.api.status);
    
//         res.api.errors = {};
    
//         // setting appropriate error objects
//         res.api.errors.code = 'UNAUTHENTICATED';
//         res.api.errors.message = 'Unauthorized!';
//         return res.status(401).send({ message: "Unauthorized!" });
//       }
//       req.userId = decoded.id;
//       next();
//     });
// }


const verifyTokenPromise = async(token) => {
  if(!token) return {};
  
  return new Promise((resolve,reject) => {
    jwt.verify(token,config.secret,(err,decoded) => err ? reject({
      code: 'UNAUTHENTICATED',
      message: 'Invalid Token!'
    }) : 
      resolve(decoded))
  } );
}

const verifyRefreshTokenPromise = async(token) => {
  if(!token) return {};
  
  return new Promise((resolve,reject) => {
    jwt.verify(token,config.refreshtokenkey,(err,decoded) => err ? reject({
      code: 'UNAUTHENTICATED',
      message: 'Invalid Token!'
    }) : 
      resolve(decoded))
  } );
}

module.exports = {
  verifyTokenPromise,
  verifyRefreshTokenPromise
}