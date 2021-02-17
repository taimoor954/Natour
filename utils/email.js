const nodemailer = require('nodemailer');
const pug = require('pug')
const dotenv = require('dotenv');
const path = require('path');
const htmlToText = require('html-to-text')
const configDIR = path.join(__dirname, '../config.env');
// console.log(configDIR)
dotenv.config({
  path: configDIR
});


exports.Email = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Muhammad Taimoor <${process.env.EMAIL_FROM}>`

  }
  newTransport() {
    //sendGrid for production
    if (process.env.NODE_ENV == 'production') {
      return 1
    }
    //mailbox for development
    return nodemailer.createTransport({
      // service : 'Gmail', //IIF YOU WANT TO USE GMAIL BUT IN A PROD APP THATS NOT A GOOD IDEA TO USE GMAIL
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,

      auth: {
        //authentication
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) //send the mail depening upon the subject
  {
    //1 render html based on a pug template passed as a parameter 
    const html = pug.renderFile(`${__dirname}/../View/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })
    //2 Define email options 
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),

    };
    //3 Create a transporta nd send email 
    await this.newTransport().sendMail(mailOptions);

  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the tour family')

  }

}


//FOR BASIC EMAIL SENDING CHECK THIS USING MAILTRAP
// const sendEmail = async (options) => {
//   //CREATE A TRANSPORTER (SERVCICE THAT WILL SEND THA MAIL LIKE GMAIL)

//   // const transporter = nodemailer.createTransport({
//   //   // service : 'Gmail', //IIF YOU WANT TO USE GMAIL BUT IN A PROD APP THATS NOT A GOOD IDEA TO USE GMAIL
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,

//   //   auth: {
//   //     //authentication
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });

//   //DEFINE THE EMAIL OTIONS
//   // const mailOptions = {
//   //   from: 'taimoormuhammad954@gmail.com',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message,

//   // };


//   //ACTUALLY SEND THE EMAIL

//   // await transporter.sendMail(mailOptions);
// };
// exports.sendEmail = sendEmail;