const mongoose = require('mongoose')
const orderCollection = require('../models/order');
const collection = require('../models/user')
const cartCollection = require('../models/cart')
const addressCollection = require('../models/address')

const checkoutPost = async (req, res) => {
  try {
     
    const {
      selectedAddress,paymentMethod,productName,quantity,totalPrice,total} = req.body;
      console.log(req.body)
      if ( !productName || !quantity || !totalPrice || !total || !paymentMethod) {
        return res.status(400).send('Invalid request. Missing required fields.');
      }
      const userData = await collection.findOne({ emailId: req.session.email });
      const userId = userData._id

      const ProductTotalPrice = await cartCollection.aggregate([{$match: {userId: userData._id}}, {$unwind: "$items"}, {$lookup: {from: "productdatas", localField: "items.productId", foreignField: "_id", as: "cartProduct"}}, {$project: {userId: 1, items: 1, productPrice: {$arrayElemAt: ["$cartProduct.productPrice", 0]}, calculatedPrice: {$multiply: ["$items.quantity", {$arrayElemAt: ["$cartProduct.productPrice", 0]}]}}}, {$group: {_id: "$items.productId", userId: {$first: "$userId"}, quantity: {$sum: "$items.quantity"}, totalPrice: {$sum: "$calculatedPrice"}, productPrice: {$first: "$productPrice"}}}]);
      const addressData = await addressCollection.findById(selectedAddress);
      console.log("Selected address:",addressData)
      // if (!mongoose.isValidObjectId(selectedAddress)) {
      //   return res.status(400).send('Invalid selected address.');
      // }
    
    const order = new orderCollection({
      userId,
      selectedAddress: addressData._id,
      items: productName.map((name, index) => ({
        productId: name,
        quantity: quantity[index],
        total: ProductTotalPrice[index].totalPrice,
      })),
      orderTotal: parseFloat(total),
      paymentMethod: paymentMethod
    });

    await order.save();
    await cartCollection.updateOne({ userId }, { $set: { items: [] } });
    res.redirect('/thankyou'); 
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).send('Internal Server Error');
  }
};

const orderManagement = async(req,res)=>{
  const orderDetails = await orderCollection.find()
  console.log("OrderDetails:",orderDetails)
  res.render('admin/orderManagement',{orderDetails})
}

module.exports = {
  checkoutPost,
  orderManagement
};
