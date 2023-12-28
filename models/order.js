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
  orderTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'Delivered', 'cancelled'],
    default: 'pending',
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type : Boolean,
    default: false,
  },
  isPending: {
    type: Boolean,
    default: false,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
});

const orderCollection = mongoose.model('orderData', orderSchema);
module.exports = orderCollection;
