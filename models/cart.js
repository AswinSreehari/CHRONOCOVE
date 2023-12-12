const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true 
    },
    items:[
        {
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
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
})
const cartCollection = mongoose.model('cartData',cartSchema)
module.exports = cartCollection