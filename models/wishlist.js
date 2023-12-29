const mongoose = require('mongoose')
const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productData',
        required: true
    }
})
const wishlistCollection = mongoose.model('wishlistData',wishlistSchema)
module.exports = wishlistCollection