const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
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
            //shifted this part in register.js file
            // const passwordHash=await bcrypt.hash(req.body.pass,10);
            // console.log(passwordHash);
            const registerEmployee=new Registers({
                name:req.body.name,
                email:req.body.email,
                contact:req.body.contact,
                password:req.body.pass
            });
            //const token=await registerEmployee.generateAuthToken();

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

        const userEmail=await Register.findOne({email:email});
        const passwordMatch=await bcrypt.compare(pass,userEmail.password);
        //TO generate token
        //const token=await userEmail.generateAuthToken();
        //console.log("the token part: "+token);
        console.log(passwordMatch);
        if(passwordMatch){
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

app.listen(8000,()=>{
    console.log("port 8000 listening!");
});
