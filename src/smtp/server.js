const nodemailer=require("nodemailer");
const bodyParser = require('body-parser');

const sendMail=async(email,otp)=>{
    let testAccount=await nodemailer.createTestAccount();

    //Connect with the smtp etherial
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.SECRET_MAIL,
            pass: process.env.SECRET_PASS
        }
    });
    
    //Checks the tranporter details whom to send and what to send
    let info=await transporter.sendMail({
        from: '"coinCanvas@" <dineshds015@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Email Verification", // Subject line
        text: "One Time Password: " + otp, // plain text body
        html: "<b>Hello Client!</b>", // html body
    });

    console.log("Message sent: %s",info.messageId);
    //res.send("I am sending mail");
};

module.exports={sendMail};