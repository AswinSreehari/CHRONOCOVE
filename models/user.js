const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/CHRONOCOVE')
.then(()=>{
    console.log('MongoDB Connected!!')
}).catch(()=>{
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