const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
const orderCollection = require('../models/order');
const collection = require('../models/user')
const cartCollection = require('../models/cart')
const addressCollection = require('../models/address')
const productCollection = require('../models/product')

const Razorpay = require('razorpay')
const { KEY_ID, KEY_SECRET } = process.env
let instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })

const checkoutPost = async (req, res) => {
  try {
    const {
      selectedAddress,paymentMethod,productName,quantity,totalPrice,totalValue} = req.body;
      console.log("reqBody :",req.body)
      console.log("This is Totalll:",totalValue)
      console.log("Product ID is here! :",productName)
      if ( !productName || !quantity || !totalPrice || !totalValue || !paymentMethod) {
        return res.status(400).send('Invalid request. Missing required fields.');
      }

    


      const userData = await collection.findOne({ emailId: req.session.email }).populate("wallet");;
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
      orderTotal: parseFloat(totalValue),
      paymentMethod: paymentMethod
    });

    // cheythathu by sanal for payment using wallet-- start here
    
    if(paymentMethod==="Wallet"){
      console.log("inside wallet!!")
      if (order.orderTotal <= userData.wallet.balance) {
        await order.save();
        console.log("order total:",order.orderTotal)
        
        const transactionAmount = -order.orderTotal; // Debit from the wallet
        const transactionType = 'Debit';
    
        // Update the wallet balance
        userData.wallet.balance -= order.orderTotal;
    
        // Add a new transaction to the 'transactions' array
        userData.wallet.transactions.push({
          amount: transactionAmount,
          type: transactionType,
        });
    
        // Save the changes to the wallet
        await userData.wallet.save();
      }
    }
    
    // cheythathu by sanal for payment using wallet-- start end here
    else{
      await order.save();
    }
    
    
   
    
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

const payPost = async (req, res) => {
  try {
    console.log('paypost');
    const { totalPrice } = req.body;
    console.log("the price of the product is :",totalPrice)
    const razorpayOrder = await instance.orders.create({
      amount: Number(totalPrice),  
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });
    console.log('razorpay log:', razorpayOrder);
    return res.json(razorpayOrder).send();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

//<!--------------------------Admin_Order_Management------------------------------------------->

const ITEMS_PER_PAGE = 10;  

const orderManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const totalOrders = await orderCollection.countDocuments();
        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

        const orderDetails = await orderCollection.find().skip(skip).limit(ITEMS_PER_PAGE);

        res.render('admin/orderManagement', { orderDetails, currentPage: page, totalPages });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/error');
    }
};


 //<!------------------------------------order Status---------------------------------------->

 const orderStatus = async(req,res) => {
  console.log("helooo");
  const orderId = req.params.id; 
  const { newStatus } = req.body;
  console.log("OrderID at orderStatus:",orderId)
  console.log("NewStatus:",{ newStatus })

    try {
         const updatedOrder = await orderCollection.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
        if(updatedOrder){
          res.json({ success: true, updatedOrder });

        }else{
          res.json({ success: false });

        }
        } catch (error) {
        console.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
 }

 //<!--------------------------------Admin Oder Details-------------------------------------->
 
 const AdminViewOrderDetails = async (req, res) => {
   const orderId = req.params.id;
   if (!mongoose.Types.ObjectId.isValid(orderId)) {
     return res.status(400).send("You tried to mess with me. But I am not messable");
    }

  const orderData = await orderCollection.findById(orderId);
  if (!orderData) {
    return res.status(404).send("Order not found.");
  }
  

  console.log(req.params);
 
  const userData = await collection.findOne({ emailId: req.session.email });
  const subId = orderData.selectedAddress
  const userId = userData._id;
  const address = await addressCollection.findOne({userId})
  const addressIndex = address.Address.findIndex(e => e._id.toString() === subId.toString())
   const addressDetails = address.Address[addressIndex]

  const orderProducts = await getProductDetails(orderData.items);
  res.render('Admin/viewOrderDetails', { orderData, orderProducts , userData,addressDetails });
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
  orderStatus,
  payPost,
};

