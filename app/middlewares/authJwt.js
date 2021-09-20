const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;


verifyToken = (req,res,next) => {

   let token = req.headers["x-access-token"];
    console.log(token)
   if (!token) {
    return res.status(403).send({ message: "No token provided!" });
   }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });

}

verifyRefreshToken = async (req,res,next) =>{

  let token = req.body.refreshToken;
  console.log(token);
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
   }

   jwt.verify(token,config.refreshtokenkey,(err,decoded) =>{
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const userId = decoded.id;

    var accesstoken = jwt.sign({ id: userId }, config.secret, {
      expiresIn: 3600 // 24 hours
    });
    var refreshtoken = jwt.sign({ id: userId }, config.refreshtokenkey, {
      expiresIn: 604800 // 168 hours
    });
    return res.status(200).send({ accessToken: accesstoken,refreshToken : refreshtoken});

   })
}


verifyAccessToken = async (req,res,next) => {
  let token = req.body.accessToken;

  if (!token) {
    return res.status(200).send({ status:false, message: "Unauthorized!" });
   }

   jwt.verify(token,config.secret,(err,decoded) =>{
    if (err) {
      return res.status(200).send({ status:false, message: "Unauthorized!" });
    }

    return res.status(200).send({  status:true, message: "Authorized!" });

   })
}

isAdmin = (req,res,next) => {
  
 User.findById(req.userId).exec((err,user) => {
  if(err){
      res.status(500).send({ message: err });
      return;
  }
 
  Role.find(
  {
   _id:  { $in: user.roles}

  },
  (err,roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};



isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  verifyRefreshToken,
  verifyAccessToken
};
module.exports = authJwt;

