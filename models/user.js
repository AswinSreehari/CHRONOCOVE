require('dotenv').config();

const mongoose = require('mongoose')

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
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wallet'
    },
    sessionId: {
        type: String,
        required: false
    }
})

const collection = new mongoose.model('user',LoginSchema)
module.exports=collection