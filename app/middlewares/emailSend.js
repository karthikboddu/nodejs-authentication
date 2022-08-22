var nodemailer = require('nodemailer');


const sendPasswordReset = async(email,url) => {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM_ID,
      pass: process.env.EMAIL_PASSWORD,
    }
  });
  
  var mailOptions = {
    from: process.env.EMAIL_FROM_ID,
    to: email,
    subject: 'Reset password from local',
    text: url
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log('Email sent: ' + info.response);
      return true;
    }
  });
}

module.exports = {
  sendPasswordReset
}