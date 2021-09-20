const { getUserLoginInfo,getPreUserLoginInfo } =  require("../services/auth.service");

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

exports.getUserLoginDetails = async (req,res,next) => {

  let token = req.headers["x-access-token"];
  console.log(token)
  if (!token) {
   return res.status(403).send({ message: "No token provided!" });
  }
  if(!token) throw createError.BadRequest();

  const userLoginDetails = await getUserLoginInfo(req,next,token);


  res.send(userLoginDetails);

}

exports.getPreUserLoginDetails = async (req,res,next) => {

  let token = req.headers["x-access-token"];
  console.log(token)
  if (!token) {
   return res.status(403).send({ message: "No token provided!" });
  }
  if(!token) throw createError.BadRequest();

  const userLoginDetails = await getPreUserLoginInfo(req,next,token);


  res.send(userLoginDetails);

}


// exports.getUserDetailsFromRefreshToken = async (req,res,next) => {

//   let token = req.headers["x-access-token"];
//   console.log(token)
//   if (!token) {
//    return res.status(403).send({ message: "No token provided!" });
//   }
//   if(!token) throw createError.BadRequest();



// }