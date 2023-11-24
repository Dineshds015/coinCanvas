require("dotenv").config();
const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const crypto = require('crypto');
const notifier=require("node-notifier");
const requests=require("requests");
const alert=require("alert");
const port=process.env.PORT || 8000;
require("./db/conn");

const Registers=require("./model/register");
const Expenses=require("./model/addExpense");
const Supports=require("./model/support");
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
    if(req.cookies.emailToken==null)
        res.render("index");
    else    
        res.render("dashboard");
});

//including server.js file
const sendMailer=require("./smtp/server");
const { decode } = require("punycode");

//Generating the AlfaNumeric OTP which is moreSecure
function generateOTP() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}
const otp=generateOTP();

//Starts the Email verification using Etherial smtp server
app.post("/sendOtp",(req,res)=>{
    if(req.body.pass===req.body.cpass)
    {
        sendMailer.sendMail(req.body.email,otp);
    }
    else
    {
        //Desktop notification
        notifier.notify({
            title: '@coinCanvas',
            message: 'Password Not Matched!',
            icon: path.join(__dirname, 'icon.jpg'),
            sound: true,
            wait: true
          });
        req.body.pass=null;
        req.body.cpass=null;
    }
    
});

//Render the registerPage
app.get("/register",(req,res)=>{
    res.render("register");
});

//create a new user in our database
app.post("/register",async(req,res)=>{
    try {
        if(req.body.otp==otp)
        {
            const registerEmployee=new Registers({
                name:req.body.name,
                email:req.body.email,
                contact:req.body.contact,
                password:req.body.pass
            });
            //To check user is exists or not
            // const userEmail=await Registers.findOne({email:email});
            // if(userEmail)
            // {
            //     console.log("User already exists!");
            //     return res.status(400).send("User already exists!");
            // }
        //Inserting data into DB
        const registered=await registerEmployee.save();
        res.status(201).render("login");
        console.log("Insertion Done!");
        }
        else
        {
            //Desktop notification
            notifier.notify({
                title: '@coinCanvas',
                message: 'Invalid OTP!',
                icon: path.join(__dirname, 'icon.jpg'),
                sound: true,
                wait: true
              });
            req.body.otp=null;
        }

    } catch (error) {
        res.status(400).send(error);
    }
});

//Render login page
app.get("/login",(req,res)=>{
    if(req.cookies.emailToken==null)
        res.render("login");
    else    
        res.render("dashboard");
});

//Login as well as Generating tokenCookie
app.post("/login",async(req,res)=>{
    
    try {
        const email=req.body.email;
        const pass=req.body.pass;
        const userEmail=await Registers.findOne({email:email});
        //To check Email validation 
        if(userEmail==null)
        {
            console.log("User Not Found!");
            return res.status(400).send("User Not Found!");
        }
        const passwordMatch=await bcrypt.compare(pass,userEmail.password);
        
        if(passwordMatch){
            const userData ={username:userEmail.email};
            //Token setup
            const token = jwt.sign(userData,'coinCanvas',{ expiresIn: '1h' });
            const cookieOptions = {
                expiresIn:'1h',
                httpOnly: true,
              };
            //Cookie setup
            res.cookie("emailToken",token, cookieOptions);
            res.redirect("dashboard");
        }
        else{
            //Desktop notification
            notifier.notify({
                title: '@coinCanvas',
                message: 'Invalid Details!',
                icon: path.join(__dirname, 'icon.jpg'),
                sound: true,
                wait: true
              });
            req.body.otp=null;
        }
    } catch (err) {
        res.send(err);
    }
});

//Logout which destroys the cookie
app.get('/logout',(req, res)=>{
    // Destroy the cookie
    if(req.cookies.emailToken==null)
        res.redirect("login");
    res.clearCookie('emailToken');
    res.redirect('/');
});

//Dashboard Page
app.get("/dashboard",async(req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        //Checking the token which is login user
        const decoded =await jwt.verify(req.cookies.emailToken,"coinCanvas");
        console.log(decoded.username);
        const expenseDetails=await Expenses.find({user:decoded.username});
        console.log(expenseDetails.amount);
        const userEmailToken={
            username:decoded.username,
            expense:expenseDetails
        }
        res.render("dashboard",userEmailToken);
      } 
    catch (err) {
        res.render("index");
        res.redirect('/');
    }
});

//To redirect addExpense page
app.get("/addExpense",async (req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        //Checking the token which is login user
        const decoded =await jwt.verify(req.cookies.emailToken,"coinCanvas");
        console.log(decoded.username);
        const expenseDetails=await Expenses.find({user:decoded.username});

        // Calculate total expenses
        const totalExpenses = expenseDetails.reduce((total, expense) => total + expense.amount, 0);
        console.log('Total Expenses:', totalExpenses);

        // Find expenses with payment status "Pending"
        const pendingExpenses = await Expenses.find({ user: decoded.username, paymentStatus: "Pending" });
        // Calculate total pending expenses
        const totalPendingExpenses = pendingExpenses.reduce((total, expense) => total + expense.amount, 0);
        console.log('Total Pending Expenses:', totalPendingExpenses);

        // Find expenses with payment status "Pending"
        const doneExpenses = await Expenses.find({ user: decoded.username, paymentStatus: "Done" });
        // Calculate total pending expenses
        const totalDoneExpenses = doneExpenses.reduce((total, expense) => total + expense.amount, 0);
        console.log('Total Pending Expenses:', totalDoneExpenses);

        const userEmailToken={
            username:decoded.username,
            expenses:expenseDetails,
            totalExpenses:totalExpenses,
            totalPendingExpenses:totalPendingExpenses,
            totalDoneExpenses:totalDoneExpenses
        }
        res.render("addExpense",userEmailToken);
      } 
    catch (err) {
        res.render("index");
        res.redirect('/');
    }
});


//addExpanse in our database
app.post("/addExpense",async(req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        //Checking the token which is login user
        const decoded = jwt.verify(req.cookies.emailToken,"coinCanvas");
            const addNewExpense=new Expenses({
                amount:req.body.amount,
                category:req.body.category,
                paymentMethod:req.body.payMethod,
                paymentDate:req.body.payDate,
                Description:req.body.description,
                paymentStatus:req.body.payStatus,
                user:decoded.username
            });
            const registered=await addNewExpense.save();
            res.redirect("addExpense");
            console.log("Expense Added Successfully!");
    } catch (error) {
        res.status(400).send(error);
    }
});


// Route to update an expense
app.post('/updateExpense', async (req, res) => {
    const { _id, category, amount, paymentMethod, Description, paymentDate, paymentStatus } = req.body;

    try {
        await Expenses.findByIdAndUpdate(_id, {
            category,
            amount,
            paymentMethod,
            Description,
            paymentDate,
            paymentStatus
        });

        res.status(200).send('Expense updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete an expense
app.get('/deleteExpense/:id', async (req, res) => {
    const expenseId = req.params.id;
    try {
        await Expenses.findByIdAndDelete(expenseId);
        res.status(200).send('Expense deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Fetching about page
app.get("/currency",(req,res)=>{
    let data='';
    requests("http://api.exchangeratesapi.io/v1/latest?access_key=7b81a7b0177ec6b960aff916c22f2975&format=1").on("data",(chunk)=>{
            data+=chunk;
        }).on("end",(err)=>{
            if(err)
                return console.log("Connection closed due to errors",err);
            try {
                const objdata = JSON.parse(data);
                const arrData = [objdata];
                console.log(arrData[0].rates.USD);
                const currData={
                    inrRate:arrData[0].rates.INR,
                    usdRate:arrData[0].rates.USD,
                    audRate:arrData[0].rates.AUD,
                    jpyRate:arrData[0].rates.JPY
                }
                // Render the currency.hbs file with the USD rate
                res.render("currency", currData);
            } catch (error) {
                console.error("Error parsing JSON data", parseError);
                res.status(500).send('Internal Server Error');
            }
        }); 
        //res.render("currency");
});

//To redirect support page
app.get("/support",async (req,res)=>{
    if(req.cookies.emailToken==null)
        res.redirect("login");
    try {
        //Checking the token which is login user
        const decoded =await jwt.verify(req.cookies.emailToken,"coinCanvas");
        console.log(decoded.username);
        const expenseDetails=await Registers.find({email:decoded.username});
        const userEmailToken={
            username:decoded.username,
            expense:expenseDetails
        }
        res.render("support",userEmailToken);
      } 
    catch (err) {
        res.render("dashboard");
        res.redirect('/dashboard');
    }
});

app.post("/support",async(req,res)=>{
    try {
        const supportEmployee=new Supports({
            name:req.body.name,
            email:req.body.email,
            contact:req.body.contact,
            subject:req.body.subject,
            description:req.body.description
        });
    //Inserting data into DB
    await supportEmployee.save();
    res.status(201).render("dasboard");
    console.log("Insertion Done!");

    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/about",(req,res)=>{
    res.render("about");
});


//Starts the server on $PORT which is by default 8000
app.listen(port,()=>{
    console.log(`port ${port} listening!`);
});
