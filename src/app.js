require("dotenv").config();
const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const port=process.env.PORT || 8000;
require("./db/conn");

const Registers=require("./model/register");
const async = require("hbs/lib/async");

const staticPath=path.join(__dirname,"../public");
const templatePath=path.join(__dirname,"../templates/views");
const partialsPath=path.join(__dirname,"../templates/partials");

app.use(express.static(staticPath));
app.set("view engine","hbs");
app.set("views",templatePath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    //res.send("hello from Dinesh");
    res.render("index");
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

            const token=await registerEmployee.generateAuthToken();

            // res.cookie("jwt",token,{
            //     expires:new Date(Date.now()+2000),
            //     httpOnly:true
            // });
            // console.log(cookie);

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

        const userEmail=await Registers.findOne({email:email});
        const passwordMatch=await bcrypt.compare(pass,userEmail.password);

        if(passwordMatch){
            //TO generate token
            const token=await userEmail.generateAuthToken();
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+2000),
                httpOnly:true
            });
            res.status(201).render("index");
            res.send("Login Successfully");
        }
        else{
            res.send("Invalid Details");
        }
        //console.log(`${passCheckHash} from page\n${userEmail.password} from db`)
    } catch (err) {
        res.send(err);
    }
});

app.get("/about",(req,res)=>{
    res.render("about");
});

app.listen(port,()=>{
    console.log(`port ${port} listening!`);
});
