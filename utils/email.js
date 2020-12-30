const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

const configDIR = path.join(__dirname, '../config.env');
// console.log(configDIR)
dotenv.config({ path: configDIR });
// console.log(`${__dirname},"../config.env"`)
// console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_HOST);
const sendEmail = async (options) => {
  //CREATE A TRANSPORTER (SERVCICE THAT WILL SEND THA MAIL LIKE GMAIL)
  const transporter = nodemailer.createTransport({
    // service : 'Gmail', //IIF YOU WANT TO USE GMAIL BUT IN A PROD APP THATS NOT A GOOD IDEA TO USE GMAIL
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
      //authentication
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //DEFINE THE EMAIL OTIONS
  const mailOptions = {
    from: 'taimoormuhammad954@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
   
  };
  //ACTUALLY SEND THE EMAIL
  await transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
