require('dotenv').config();

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
   })
.then(()=>{
    console.log('MongoDB Connected!!')
}).catch((err)=>{
    console.log("MongoConnectionError:",err)
    console.log("Failed to Connect!!")
})
const LoginSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },

    emailId:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
})

const collection = new mongoose.model('user',LoginSchema)
module.exports=collection