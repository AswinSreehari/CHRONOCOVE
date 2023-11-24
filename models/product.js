const mongoose = require('mongoose')
const { boolean } = require('webidl-conversions')
const productSchema = new mongoose.Schema({
    productName:{
        type : String,
        required : true,
    },
    productDescription : {
        type : String,
        required : true,
    },
    productCategory : {
        type : String,
        required : true,
    },
    mainProductImage:{
        type : [String],
        required : true,
    },
    additionalProductImage:{
        type : [String],
        required : true,
    },
    productPrice:{
        type : Number,
        required : true
    },
    productQuantity:{
        type : Number,
        required : true
    },
    isDeleted: {
        type: Boolean,
        default:false
    },
})
const productCollection = new mongoose.model('productData',productSchema)
module.exports = productCollection