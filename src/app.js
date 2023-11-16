require("dotenv").config();
const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");

const port=process.env.PORT || 8000;
require("./db/conn");

const Registers=require("./model/register");
const Expenses=require("./model/addExpense");
const async = require("hbs/lib/async");

const staticPath=path.join(__dirname,"../public");
const templatePath=path.join(__dirname,"../templates/views");
const partialsPath=path.join(__dirname,"../templates/partials");

app.use(express.static(staticPath));
app.set("view engine","hbs");
app.set("views",templatePath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(cookieParser());
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
                password:req.body.pass
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
    if(req.cookies.emailToken==null)
        res.render("login");
    else    
        res.render("dashboard");
});
app.post("/login",async(req,res)=>{
    try {
        const email=req.body.email;
        const pass=req.body.pass;
        const userEmail=await Registers.findOne({email:email});
        const passwordMatch=await bcrypt.compare(pass,userEmail.password);

        if(passwordMatch){
            const userData ={username:userEmail.email};
            const token = jwt.sign(userData,'coinCanvas',{ expiresIn: '1h' });
            const cookieOptions = {
                expiresIn:'1h',
                httpOnly: true,
              };
            res.cookie("emailToken",token, cookieOptions);
            // const decoded = jwt.verify(req.cookies.emailToken,"coinCanvas");
            // console.log(decoded.username);
            res.redirect("dashboard");
            //res.render('dashboard');
        }
        else{
            res.send("Invalid Details");
        }
    } catch (err) {
        res.send(err);
    }
});
app.get('/logout',(req, res)=>{
    // Destroy the cookie
    if(req.cookies.emailToken==null)
        res.redirect("login");
    res.clearCookie('emailToken');
    res.redirect('/');
});

app.get("/dashboard",(req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        const decoded = jwt.verify(req.cookies.emailToken,"coinCanvas");
        console.log(decoded.username);
        const userEmailToken={
            username:decoded.username
        }
        res.render("dashboard",userEmailToken);
      } 
    catch (err) {
        res.render("index");
        res.redirect('/');
    }
});

app.get("/addExpense",(req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    res.render("addExpense");
});

//addExpanse in our database
app.post("/addExpense",async(req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        const decoded = jwt.verify(req.cookies.emailToken,"coinCanvas");
            const addNewExpense=new Expenses({
                amount:req.body.amount,
                category:req.body.category,
                paymentMethod:req.body.payMethod,
                paymentDate:req.body.payDate,
                Description:req.body.description,
                user:decoded.username
            });
            const registered=await addNewExpense.save();
            res.status(201).render("dashboard");
            console.log("Expense Added Successfully!");
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/about",(req,res)=>{
    res.render("about");
});

app.listen(port,()=>{
    console.log(`port ${port} listening!`);
});
