const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
const orderCollection = require('../models/order');
const collection = require('../models/user')
const cartCollection = require('../models/cart')
const addressCollection = require('../models/address')

const checkoutPost = async (req, res) => {
  try {
     
    const {
      selectedAddress,paymentMethod,productName,quantity,totalPrice,total} = req.body;
      console.log("reqBody :",req.body)
      if ( !productName || !quantity || !totalPrice || !total || !paymentMethod) {
        return res.status(400).send('Invalid request. Missing required fields.');
      }
      const userData = await collection.findOne({ emailId: req.session.email });
      const userId = userData._id

      const ProductTotalPrice = await cartCollection.aggregate([{$match: {userId: userData._id}}, {$unwind: "$items"}, {$lookup: {from: "productdatas", localField: "items.productId", foreignField: "_id", as: "cartProduct"}}, {$project: {userId: 1, items: 1, productPrice: {$arrayElemAt: ["$cartProduct.productPrice", 0]}, calculatedPrice: {$multiply: ["$items.quantity", {$arrayElemAt: ["$cartProduct.productPrice", 0]}]}}}, {$group: {_id: "$items.productId", userId: {$first: "$userId"}, quantity: {$sum: "$items.quantity"}, totalPrice: {$sum: "$calculatedPrice"}, productPrice: {$first: "$productPrice"}}}]);
  
      const ourAddress = await addressCollection.findOne({ 'Address._id': new ObjectId(selectedAddress) });
      console.log("ourAddress:",ourAddress)
      const ourAddressIdx = ourAddress.Address.findIndex(e => e._id.equals(selectedAddress));
      const address = ourAddress.Address[ourAddressIdx];
    
    const order = new orderCollection({
      userId,
      selectedAddress: address,
      items: productName.map((name, index) => ({
        productId: name,
        quantity: quantity[index],
        total: ProductTotalPrice[index].totalPrice,
      })),
      orderTotal: parseFloat(total),
      paymentMethod: paymentMethod
    });
    
    await order.save();
    console.log("Order Data",order)
    await cartCollection.updateOne({ userId }, { $set: { items: [] } });
    res.redirect('/thankyou'); 
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).send('Internal Server Error');
  }
};
//<!--------------------------Admin_Order_Management------------------------------------------->

const orderManagement = async(req,res)=>{
  const orderDetails = await orderCollection.find()
  console.log("OrderDetails:",orderDetails)
  res.render('admin/orderManagement',{orderDetails})
}

const AdminViewOrderDetails = (req,res) => {
  res.render('admin/viewOrderDetails')
}

module.exports = {
  checkoutPost,
  orderManagement,
  AdminViewOrderDetails
};

 