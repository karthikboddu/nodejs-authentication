const config = require("../config/auth.config");
const db = require("../models");
const { requestPasswordReset, resetPassword, verifyRefreshToken, userLoginInfo, updateLoginInfo } = require("../services/auth.service");
const {setConfiguration, getConfigurations} = require('../services/config.service');
var middle = require("../middlewares");
var jwt = require("jsonwebtoken");
const createError = require('http-errors');
const crypto = require('crypto');
var bcrypt = require("bcryptjs");
const { authJwt } = require("../middlewares");
const redis = require('../helpers/init_redis');

const algorithm = config.aesAlgo;
var key = config.aesKey;
var iv = config.aesIv;

const User = db.user;
const Role = db.role;



exports.signup = (req, res) => {
  console.log(req, "req")
  const userData = JSON.parse(req.body.data);
  const user = new User({
    username: userData.username,
    email: userData.email,
    password: bcrypt.hashSync(userData.password, 8)
  });
  var token = jwt.sign({ id: user.id }, config.secret, {
    expiresIn: 3600 // 24 hours
  });
  var refreshtoken = jwt.sign({ id: user.id }, config.refreshtokenkey, {
    expiresIn: 604800 // 168 hours
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (userData.roles) {
      Role.find(
        {
          name: { $in: userData.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({
            accessToken: token,
            refreshToken: refreshtoken,
            message: "User was registered successfully!"
          });
        });
      });
    }
  });
};

function encrypt(plainText, key, outputEncoding = "base64") {
  const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
  return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(outputEncoding);
}

function decrypt(cipherText, key, outputEncoding = "utf8") {
  const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
  return Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
}


exports.signin = (req, res) => {
    User.findOne({
      username: req.body.username
    })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({status:false, message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ status:false, message: "User Not found." });
      }
      //decrypt(req.body.password,key,iv);
      var pass = decrypt(Buffer.from(req.body.password, "base64"), key, "utf8")
      //aes.decrpt()
      console.log(pass, "pass")
      pass = pass.replace(/^"|"$/g, '');
      var passwordIsValid = bcrypt.compareSync(
        pass,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          status:false,
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 3600 // 24 hours
      });
      var refreshtoken = jwt.sign({ id: user.id }, config.refreshtokenkey, {
        expiresIn: 604800 // 168 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      userLoginInfo(req, res, token, user.id, "login");

      redis.SET(user.id, refreshtoken, 'EX', 604800, (err, reply) => {
      })
      res.status(200).send({
        // id: user._id,
        // username: user.username,
        // email: user.email,
        // roles: authorities,
        status:true,
        accessToken: token,
        refreshToken: refreshtoken
      });
    });
};

exports.resetPasswordRequest = async (req, res, next) => {

  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );

  res.send({ status: 1, data: requestPasswordResetService, message: "" });

}

exports.resetPassword = async (req, res, next) => {

  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  res.send({ status: 1, data: resetPasswordService, message: "" });
}


exports.logoutUser = async (req, res, next) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) throw createError.BadRequest()
    jwt.verify(refreshToken, config.refreshtokenkey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
    });
    console.log(req.user.id)
    userLoginInfo(req, res, refreshToken, req.user.id, "logout");
    redis.DEL(req.user.id, (err, val) => {
      if (err) {
        console.log(err.message);
        throw createError.InternalServerError()
      }
      console.log(val)

    })
    res.sendStatus(204)
  } catch (error) {
    next(error);
  }
}

exports.addConfiguration = async (req,res,next) => {
  try {
    const { name,key,value } = req.body;
    if (!name && !key && value) throw createError.BadRequest()
    const resAddConfigurations = await setConfiguration(res,name,key,value);
   // return res.send({ status: 1,message: "" });
  } catch (error) {
    next(error);
  }
  }


exports.getConfigs = async (req,res,next) => {

    try {
      
      const getdata = await getConfigurations(res);
      //return res.send({ status: true, data : getdata, message: "ss" });
    } catch (error) {
      next(error);
    }

}
