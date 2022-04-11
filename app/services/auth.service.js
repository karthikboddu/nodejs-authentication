const JWT = require("jsonwebtoken"),
  { jwtSignAccessRefreshToken } = require('../helpers/jwt_helpers'),
  { verifyTokenPromise, verifyRefreshTokenPromise } = require('../middlewares/validateJwt'),
  db = require("../models"),
  config = require("../config/auth.config.js"),
  crypto = require("crypto"),
  bcrypt = require("bcrypt"),
  User = db.user,
  Token = db.token,
  Role = db.role,
  tenant = db.tenant.tenantModel,
  userLogin = db.userlogin,
  customId = require("custom-id"),
  emailService = require('../middlewares/emailSend'),
  clientURL = 'localhost:4200',
  { result } = require("lodash"),
  Promise = require('bluebird');

const signUpData = async (req, res, userData) => {

  return new Promise((resolve, reject) => {

    const user = new User({
      username: userData.username,
      email: userData.email,
      password: bcrypt.hashSync(userData.password, 8)
    });
    const jwtData = jwtSignAccessRefreshToken(user.id);

    user.save((err, user) => {
      if (err) {
        reject({ status: 500, message: err });
      }

      if (userData.roles) {
        Role.find(
          {
            name: { $in: userData.roles }
          },
          (err, roles) => {
            if (err) {
              reject({ status: 500, message: err });
            }

            user.roles = roles.map(role => role._id);
            user.save(err => {
              if (err) {
                reject({ status: 500, message: err });
              }
              resolve({ status: 200, message: "User was registered successfully!" });
            });
          }
        );
      } else {
        Role.findOne({ name: "user" }, (err, role) => {
          if (err) {
            reject({ status: 500, message: err });
          }

          user.roles = [role._id];
          user.save(err => {
            if (err) {
              reject({ status: 500, message: err });
            }
            resolve({
              status: 200,
              data: jwtData,
              message: "User was registered successfully!"
            });
          });
        });
      }
    });
  });
}

const signInData = (req, res, data) => {

  return new Promise((resolve, reject) => {

    User.findOne({
      username: data.username
    })
      .populate("roles", "-__v")
      .exec((err, user) => {
        if (err) {
          reject({ status: 500, message: err });
        }
        console.log(user, "user")
        if (!user || user == null) {
          console.log(user, "user")
          //reject({ status: 404, message: "User Not found." });
          return res.status(404).send({ status: 404, message: "User Not found." });
        }
        //decrypt(req.body.password,key,iv);
        //var pass = decrypt(Buffer.from(req.body.password, "base64"), key, "utf8")
        var pass = data.password
        //aes.decrpt()
        console.log(pass, "pass")
        pass = pass.replace(/^"|"$/g, '');
        var passwordIsValid = bcrypt.compareSync(
          pass,
          user.password
        );
        if (!passwordIsValid) {
          reject({
            status: false,
            accessToken: null,
            message: "Invalid Password!"
          });
        }

        const jwtData = jwtSignAccessRefreshToken(user.id)
        userLoginInfo(req, res, jwtData.accessToken, user.id, "login");
        resolve({ status: 200, data: jwtData })
      });
  });
}


const requestPasswordReset = async (email) => {

  const user = await User.findOne({ email });
  console.log(Token, "user")
  if (!user) throw new Error("User does not exist");

  let token = await Token.findOne({ userId: user._id })

  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");

  const hash = await bcrypt.hash(resetToken, Number(8));


  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();


  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
  $status = emailService.sendPasswordReset(email, link);
  return link;
}


const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId })

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await bcrypt.hashSync(password, 8);

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true },
  );

  await passwordResetToken.deleteOne();
  return true;

}



const verifyRefreshToken = (refreshToken) => {
  if (!refreshToken) {
    return res.status(403).send({ message: "No token provided!" });
  }

  JWT.verify(refreshToken, config.refreshtokenkey, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    const userid = decoded.id;

    return userid;

  })

}

const userLoginInfo = async (req, res, token, id, type) => {
  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var deviceDetails = req.headers["user-agent"];
  const token_secret = await customId({
    token_secret: token,
    date: Date.now(),
    randomLength: 8
  });
  const userlogin = new userLogin({
    tokenId: token_secret,
    ipAddress: ip,
    device: deviceDetails,
  })
  await userLogin.find({
    userId: id, ipAddress: ip, device: deviceDetails
  }, function (err, docs) {
    console.log(docs.length, "docs")
    if (docs.length == 0 || docs.length < 0) {
      userlogin.save((err, user) => {

        console.log(id, "userDetails")
        userlogin.userId = id;
        userlogin.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
        });
      })
    } else {
      updateLoginInfo(req, docs[0].id, type)
    }
  }
  );
}
const getUserLoginInfo = async (req, next, token) => {
  let result = {};
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
    return await userLogin.find({ userId: req.userId }).populate({ path: 'userId', select: ['username'] });
  } else {
    return result;
  }


}

const getPreUserLoginInfo = async (req, next, token) => {

  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var deviceDetails = req.headers["user-agent"];
  let result = {};
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
    req.userId = tokenDecoded.id;
    return await userLogin.find({ userId: req.userId, ipAddress: ip, device: deviceDetails }).populate({ path: 'userId', select: ['username'] });
  } else {
    return result;
  }


}

const updateLoginInfo = async (req, id, type) => {

  if (type == "login") {
    const data = {
      loggedinAt: new Date(),
      islogout: false
    }
    userLogin.findByIdAndUpdate(id, data, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          // res.status(404).send({
          //   message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
          // });
        } else console.log("updated")
      })
      .catch(err => {
        console.log(err, "err")
      });
  } else {
    const data = {
      loggedoutAt: new Date(),
      islogout: true
    }
    userLogin.findByIdAndUpdate(id, data, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          // res.status(404).send({
          //   message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
          // });
        } else console.log("updated")
      })
      .catch(err => {
        console.log(err, "err")
      });
  }

}

const getUserInfoFromToken = async (req, next, token) => {
  let result = {};

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
    let userId = tokenDecoded.id;
    //const user = await User.findOne({ _id: userId });
    const user = await tenant.findOne({ _id: userId });
    console.log(userId, "user")
    if (!user) throw new Error("User does not exist");
    return user;
  } else {
    return result;
  }


}


module.exports = {
  requestPasswordReset,
  resetPassword,
  verifyRefreshToken,
  userLoginInfo,
  getUserLoginInfo,
  updateLoginInfo,
  getPreUserLoginInfo,
  signUpData,
  signInData,
  getUserInfoFromToken
};
