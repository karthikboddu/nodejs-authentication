const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const { jwtSignAccessRefreshToken } = require('../helpers/jwt_helpers')
const { verifyTokenPromise, verifyRefreshTokenPromise } = require('./validateJwt')


verifyToken = async(req, res, next) => {

  let token = req.headers["x-access-token"];
  let result = {};

  if (!token) {
    const error = {
      code: 'UNAUTHENTICATED',
      message: 'No token provided!'
    }
    result = {
      status: 403,
      errors: error,
      data: ''
    }
    return res.send(result);
  }

  const tokenDecoded = await verifyTokenPromise(
    token
  ).catch(err => {
    result = {
      status: 401,
      errors: err,
      data: ''
    }
  }) || {};

  if (tokenDecoded.id) {
    req.userId = tokenDecoded.id;
  }
  next();
}

verifyRefreshToken = async (req, res, next) => {

  let token = req.body.refreshToken;
  let result = {};
  if (!token) {

    const error = {
      code: 'UNAUTHENTICATED',
      message: 'No token provided!'
    }
    result = {
      status: 403,
      errors: error,
      data: ''
    }
    return res.send(result);
  }

  const tokenDecoded = await verifyRefreshTokenPromise(
    token
  ).catch(err => {
    result = {
      status: 401,
      errors: err,
      data: ''
    }

  }) || {};

  if (tokenDecoded.id) {
    const userId = tokenDecoded.id;
    const jwtData = jwtSignAccessRefreshToken(userId);
    result = {
      status: 200,
      data: jwtData
    }

  }
  return res.status(200).send(result);
}


verifyAccessToken = async (req, res, next) => {

  let token = req.body.accessToken;
  let result = {};
  if (!token) {
    const error = {
      code: 'UNAUTHENTICATED',
      message: 'No token provided!'
    }
    result = {
      status: 403,
      errors: error,
      data: ''
    }
    return res.send(result);
  }
  const tokenD = await verifyTokenPromise(
    token
  ).catch(err => {
    result = {
      status: 401,
      errors: err,
      data: ''
    }

  }) || {};
console.log(tokenD)
  if (tokenD.id) {
    result = {
      status: 200,
      message: 'Authorized!',
      data: ''
    };
  }

  return res.status(200).send(result)
}

isAdmin = (req, res, next) => {

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

