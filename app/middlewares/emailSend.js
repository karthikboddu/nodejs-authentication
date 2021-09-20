var nodemailer = require('nodemailer');


const sendPasswordReset = async(email,url) => {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bkarthik184@gmail.com',
      pass: 'Kartik@23'
    }
  });
  
  var mailOptions = {
    from: 'bkarthik184@gmail.com',
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