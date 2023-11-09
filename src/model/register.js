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
        const token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
        //console.log(token);
        //console.log(process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({tokenArr:token});
        await this.save();
        return token;
    } catch (err) {
        res.send("The err part: "+err);
        console.log("The err part: "+err);
    }
}

//hashed password
employeeSchema.pre("save",async function(next){
    //console.log(`Pre password: ${this.password}`);
    this.password=await bcrypt.hash(this.password,10);
    //console.log(`Post password: ${this.password}`);
})

const Register=new mongoose.model("register",employeeSchema);
module.exports=Register;