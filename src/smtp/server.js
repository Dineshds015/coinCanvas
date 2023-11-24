const nodemailer=require("nodemailer");
const bodyParser = require('body-parser');

const sendMail=async(email,otp)=>{
    let testAccount=await nodemailer.createTestAccount();

    //Connect with the smtp etherial
    const transporter = nodemailer.createTransport({
        service:'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure:false,
        auth: {
            user: "dineshdp015@gmail.com",
            pass: "rjno yoec ejwk oxij"
        }
    });
    
    //Checks the tranporter details whom to send and what to send
    let info=await transporter.sendMail({
        from: process.env.SECRET_MAIL, // sender address
        to: email, // list of receivers
        subject: "Email Verification", // Subject line
        text: "One Time Password: " + otp, // plain text body
        html: `<b>OTP Verification!</b><h1>${otp}</h1>`, // html body
    });

    console.log("Message sent: %s",info.messageId);
    //res.send("I am sending mail");
};

module.exports={sendMail};