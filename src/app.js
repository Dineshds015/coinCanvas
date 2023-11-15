require("dotenv").config();
const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const session = require('express-session');

const port=process.env.PORT || 8000;
require("./db/conn");

const Registers=require("./model/register");
const async = require("hbs/lib/async");

const staticPath=path.join(__dirname,"../public");
const templatePath=path.join(__dirname,"../templates/views");
const partialsPath=path.join(__dirname,"../templates/partials");

app.use(express.static(staticPath));
app.use(
    session({
      secret: 'dineshds015', // Change this to a strong, random string (secret key)
      resave: false,
      saveUninitialized: false,
    })
  );
app.set("view engine","hbs");
app.set("views",templatePath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    //res.send("hello from Dinesh");
    if (req.session.username) {
        console.log(`Hello, ${req.session.username}!`);
      }
    res.render("index");
});
app.get("/secret",(req,res)=>{
    res.render("secret");
});

app.get("/register",(req,res)=>{
    //res.send("hello from Dinesh");
    res.render("register");
});

//create a new user in our database
app.post("/register",async(req,res)=>{
    try {
        const password=req.body.pass;
        const cpassword=req.body.cpass;

        if(password===cpassword){
            const registerEmployee=new Registers({
                name:req.body.name,
                email:req.body.email,
                contact:req.body.contact,
                password:req.body.pass,
                image:req.body.img
            });
            const registered=await registerEmployee.save();
            res.status(201).render("index");
            console.log("Insertion Done!");
        }
        else{
            res.send("Check password again!");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",async(req,res)=>{
    try {
        const email=req.body.email;
        const pass=req.body.pass;
        req.session.username=req.body.email;
        const userEmail=await Registers.findOne({email:email});
        const passwordMatch=await bcrypt.compare(pass,userEmail.password);

        if(passwordMatch){
            res.status(201).render("index");
            res.send(`Login Successfully \nHello ${req.session.username}`);
        }
        else{
            res.send("Invalid Details");
        }
    } catch (err) {
        res.send(err);
    }
});
app.get('/logout',(req, res)=>{
    // Destroy the session
    req.session.destroy((err)=>{
        if (err){
            console.error(err);
        }
        res.redirect('/');
    });
});

// app.get("/about",(req,res)=>{
//     res.render("about");
// });
app.get("/dashboard",(req,res)=>{
    res.render("dashboard");
});


app.listen(port,()=>{
    console.log(`port ${port} listening!`);
});
