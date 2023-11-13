const bcrypt = require("bcryptjs");
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const employeeSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    contact:String,
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    gender:String,
    tokens:[{
        tokenArr:{
            type:String,
            // required:true
        }
    }]
});

employeeSchema.methods.generateAuthToken=async function(){
    try {
        const token=jwt.sign({_id:this._id},"dineshds015dineshdp015official015");
        this.tokens=this.tokens.concat({tokenArr:token});
        await this.save();
        return token;
    } catch (err) {
        res.send("The err part: "+err);
        console.log("The err part: "+err);
    }
}
var isModified=false;
//hashed password
employeeSchema.pre("save",async function(next){
    if(!isModified)
    {
        this.password=await bcrypt.hash(this.password,10);
        isModified=true;
    }
});

const Register=new mongoose.model("register",employeeSchema);
module.exports=Register;