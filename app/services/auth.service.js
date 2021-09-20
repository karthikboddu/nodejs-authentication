const JWT = require("jsonwebtoken");
const db = require("../models");
const config = require("../config/auth.config.js");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = db.user;
const Token = db.token;
const userLogin = db.userlogin;
var customId = require("custom-id");
const emailService = require('../middlewares/emailSend');
const createError = require('http-errors');
const clientURL = 'localhost:4200';
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

    // await userLogin.findOneAndUpdate({userId : id, ipAddress: ip,device: deviceDetails},

    //     )
}
const getUserLoginInfo = async (req, next, token) => {
    JWT.verify(token, config.secret, (err, user) => {
        if (err) {
            throw new Error("Not Found");
        }
        console.log(user)
        req.user = user;

    });
    const id = req.user.id;
    const loginInfo = await userLogin.find({ userId: id }).populate({ path: 'userId', select: ['username'] });
    //('userId');
    return loginInfo;
}

const getPreUserLoginInfo = async (req, next, token) => {

    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var deviceDetails = req.headers["user-agent"];
    JWT.verify(token, config.refreshtokenkey, (err, user) => {
        if (err) {
            throw new Error("Not Found");
        }
        console.log(user)
        req.user = user;

    });
    const id = req.user.id;
    const loginInfo = await userLogin.find({ userId: id, ipAddress: ip, device: deviceDetails }).populate({ path: 'userId', select: ['username'] });
    //('userId');
    return loginInfo;
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


module.exports = {
    requestPasswordReset,
    resetPassword,
    verifyRefreshToken,
    userLoginInfo,
    getUserLoginInfo,
    updateLoginInfo,
    getPreUserLoginInfo
};
