const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
const orderCollection = require('../models/order');
const collection = require('../models/user')
const cartCollection = require('../models/cart')
const addressCollection = require('../models/address')
const productCollection = require('../models/product')

const checkoutPost = async (req, res) => {
  try {
    const {
      selectedAddress,paymentMethod,productName,quantity,totalPrice,total} = req.body;
      console.log("reqBody :",req.body)
      console.log("Product ID is here! :",productName)
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
    
    //updating Quantity
    for (const productId of productName) {
      const product = await productCollection.findById(productId);
      if (product.productQuantity >= quantity[productName.indexOf(productId)]) {
        product.productQuantity -= quantity[productName.indexOf(productId)];
        await product.save();
      } else {
        return res.status(400).send(`Not enough quantity available for product with ID ${productId}`);
      }
    }
    
    
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

 //<!------------------------------------order Status---------------------------------------->

 const orderStatus = async(req,res) => {
  const orderId = req.params.id; 
  const { newStatus } = req.body;

    try {
         const updatedOrder = await orderCollection.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
        res.json({ success: true, updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
 }

 //<!--------------------------------Admin Oder Details-------------------------------------->

const AdminViewOrderDetails = async (req, res) => {
  const orderId = req.params.id;
  console.log("OrderId:",orderId)
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).send("Enter Valid MongoDB ID");
  }

  const orderData = await orderCollection.findById(orderId);
  if (!orderData) {
    return res.status(404).send("Order not found.");
  }

  console.log(req.params);
  console.log("This is orderId : ", orderId);

  const userData = await collection.findOne({ emailId: req.session.email });
  const userId = userData._id;

  const orderProducts = await getProductDetails(orderData.items);
  res.render('admin/viewOrderDetails', { orderData, orderProducts });
};

const getProductDetails = async (items) => {
  const productIds = items.map(item => item.productId);

  try {
    const products = await productCollection.find({ _id: { $in: productIds } });
    const productDetails = {};

    products.forEach(product => {
      productDetails[product._id] = product;
    });

    return productDetails;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};

module.exports = {
  checkoutPost,
  orderManagement,
  AdminViewOrderDetails,
  orderStatus
};

 