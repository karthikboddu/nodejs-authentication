

const { requestPasswordReset, resetPassword, userLoginInfo, signUpData, signInData } = require("../services/auth.service"),
  { validateRequestBody, validateRequestBodySignIn } = require('../middlewares/validateRequest'),
  { setConfiguration, getConfigurations } = require('../services/config.service'),
  config = require("../config/auth.config"),
  jwt = require("jsonwebtoken"),
  createError = require('http-errors'),
  redis = require('../helpers/init_redis'),
  errorCode = require('../common/errorCode');



exports.signup = async (req, res, next) => {

  //console.log(req.body, "req123")
  const userData = req.body;
  let errorsArr = {};

  // validate inputs
  try {
    errorsArr = await validateRequestBody(userData);
  } catch (err) {
    return next(err);
  }

  // throw 400 error
  if (errorsArr.length) {
    const error = {
      code: errorCode.BAD_REQUEST,
      message: 'Validation error',
      details: errorsArr
    }
    const result = {
      status: 400,
      errors: error,
      data: '',
    }
    return res.send(result);
  }

  let response = [];

  try {
    const result = await signUpData(req, res, userData);
    res.send(result);
  } catch (error) {
    return res.send(error);
  }

};


exports.signin = async (req, res) => {

  const userData = req.body;
  let errorsArr = {};

  // validate inputs
  try {
    errorsArr = await validateRequestBodySignIn(userData);
  } catch (err) {
    return next(err);
  }

  // throw 400 error
  if (errorsArr.length) {

    const error = {
      code: errorCode.BAD_REQUEST,
      message: 'Validation error',
      details: errorsArr
    }
    const result = {
      status: 400,
      errors: error,
      data: '',
    }
    return res.send(result);
  }


  try {
    const result = await signInData(req, res, userData)
    res.send(result);
  } catch (error) {

  }
  // var authorities = [];

  // for (let i = 0; i < user.roles.length; i++) {
  //   authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
  // }

  if (process.env.REDIS_ON == "ON") {
    redis.SET(user.id, refreshtoken, 'EX', 604800, (err, reply) => {
    })
  }

  // let result = [];
  // result.api.status = 200;
  // result.api.data = jwtData;

};

exports.resetPasswordRequest = async (req, res, next) => {

  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );

  res.send({ status: 200, data: requestPasswordResetService, message: "" });

}

exports.resetPassword = async (req, res, next) => {

  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  res.send({ status: 200, data: resetPasswordService, message: "" });
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
    if (process.env.REDIS_ON == "ON") {
      redis.DEL(req.user.id, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError()
        }
        console.log(val)

      })
    }
    res.sendStatus(204)
  } catch (error) {
    next(error);
  }
}

exports.addConfiguration = async (req, res, next) => {
  try {
    const { name, key, value } = req.body;
    if (!name && !key && value) throw createError.BadRequest()
    const resAddConfigurations = await setConfiguration(res, name, key, value);
    // return res.send({ status: 1,message: "" });
  } catch (error) {
    next(error);
  }
}


exports.getConfigs = async (req, res, next) => {

  try {

    const getdata = await getConfigurations(res);
    //return res.send({ status: true, data : getdata, message: "ss" });
  } catch (error) {
    next(error);
  }


  exports.verifyAccessJwtToken = async (req, res, next) => {
    try {

    } catch (error) {
      next(error);
    }
  }

}
