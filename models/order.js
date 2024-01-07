const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  selectedAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addressData',
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productData',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  }],
  orderTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  isCancelled:{
    type:Boolean,
    default:false,
    required:true
  },
  orderTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
   
});

const orderCollection = mongoose.model('orderData', orderSchema);
module.exports = orderCollection;
