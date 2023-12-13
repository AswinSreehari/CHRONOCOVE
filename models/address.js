const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true 
    },
   Address:[
    {
        country: {
            type : String,
            required: true
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        address:{
            type: String,
            required: true,
        },
        landmark : {
            type: String,
            required: true,
        },
        state:{
            type: String,
            required: true,
        },
        zip:{
            type:Number,
            required: true
        },
        email:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required: true
        }
    
    }
   ]
})

const addressCollection = mongoose.model('addressData',addressSchema)
module.exports = addressCollection