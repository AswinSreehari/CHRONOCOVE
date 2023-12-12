const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
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
    state:{
        type: String,
        required: true,
    },
    zip:{
        type:Number,
        required: true
    },
    emailAddress:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required: true
    }

})

const addressCollection = mongoose.model('addressData',addressSchema)
module.exports = addressCollection