const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true 
    },
    
     productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'productData',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    total: {
        type: Number,
        required: true,
        default: 0
    }
})
const orderCollection = mongoose.model('orderData',orderSchema)
module.exports = orderCollection