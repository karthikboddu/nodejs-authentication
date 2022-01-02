

const { getUserLoginInfo, getPreUserLoginInfo,getUserInfoFromToken  } = require("../services/auth.service");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getUserLoginDetails = async (req, res, next) => {

  let token = req.headers["x-access-token"];

  const userLoginDetails = await getUserLoginInfo(req, next, token);

  res.status(200).send({ status: 200, data: userLoginDetails });

}

exports.getPreUserLoginDetails = async (req, res, next) => {

  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ status: 200, message: "No token provided!" });
  }
  if (!token) throw createError.BadRequest();

  const userLoginDetails = await getPreUserLoginInfo(req, next, token);

  res.send(userLoginDetails);
}


exports.getUserDetails = async (req, res, next) => {

  let token = req.headers["x-access-token"];

  const userLoginDetails = await getUserInfoFromToken(req, next, token);

  res.status(200).send({ status: 200, data: userLoginDetails });

}