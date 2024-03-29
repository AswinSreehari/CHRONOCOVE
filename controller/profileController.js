const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const addressCollection = require('../models/address')
const collection = require('../models/user')
const orderCollection = require('../models/order')
const cartCollection = require('../models/cart');
const productCollection = require('../models/product');
const bcrypt = require('bcrypt');
const referenceColleciton = require('../models/reference');
const walletCollection = require('../models/wallet');


//<!-------------------------------User_Profile--------------------------------------->


const profile = async(req,res) => {
  try{
    const userData = await collection.findOne({emailId:req.session.email}).populate('wallet').exec();
    const reference = await referenceColleciton.findOne({ userId: userData._id });

    console.log("UserData:",userData)
    res.render('User/profile',{userData,reference});
  }catch(err){
    console.log(err)
    res.redirect('/error')
  }
  
}
//<!-------------------------------/User_Profile--------------------------------------->

const myAddress = async(req,res) => {
  const userData = await collection.findOne({ emailId: req.session.email });
    const address  = await addressCollection.find({ userId: userData._id });
    console.log("address:",address)
    res.render('User/myAddress',{address})
}

const addAddress = (req,res) =>{
    res.render('User/addAddress')
}
const AddressPost = async(req,res)=>{
    
    const userData = await collection.findOne({ emailId: req.session.email });
      
    try {
        let userAddress = await addressCollection.findOne({ userId: userData._id })
    if(!userAddress){
        const newAddress = new addressCollection({
            userId: userData._id,
            Address:[{
                country: req.body.country,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                landmark: req.body.landmark,
                state: req.body.state,
                zip: req.body.zip,
                email:req.body.email,
                phone: req.body.phone

            }]
            
        })
        userAddress = await newAddress.save()
        
    }else{
        userAddress.Address.push({
            country: req.body.country,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                landmark: req.body.landmark,
                state: req.body.state,
                zip: req.body.zip,
                email:req.body.email,
                phone: req.body.phone
        })
        userAddress.save()
    }

    res.redirect('/myAddress')
    }catch(error){
        console.log('Error adding address:',error)
        res.redirect('/error')
    }
}

//<!----------------------------Delete_Address---------------------------------------->

const deleteAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
      const userData = await collection.findOne({ emailId: req.session.email });
      const userAddress = await addressCollection.findOne({ userId: userData._id });
      if (!userAddress) {
        return res.status(404).json({ message: "Address Not Found", success: false });
      }
      const addressIndex = userAddress.Address.findIndex(
        (addr) => addr._id.toString() === addressId.toString()
      );
      if (addressIndex === -1) {
        return res.status(404).json({ message: "Address not found in user's address list", success: false });
      }
      userAddress.Address.splice(addressIndex, 1);
      await userAddress.save();
      res.status(204).send(); 
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  };
// <!----------------------------Edit_Address-------------------------------------------->

const editAddress = async(req,res) =>{
    try {
    const addressId = req.params.id
    const ourAddress = await addressCollection.findOne({ 'Address._id': new ObjectId(addressId) });
    const ourAddressIdx = ourAddress.Address.findIndex(e => e._id.equals(addressId));
    const address = ourAddress.Address[ourAddressIdx];
    res.render('User/editAddress',{address})
}catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).send('Internal Server Error');
  }
}

const editAddressPost  = async(req,res) =>{
  const addressId = req.params.id
  console.log("AddressId a post",addressId)
 const data = req.body
const ourAddress = await addressCollection.findOne({ 'Address._id': new ObjectId(addressId) });
const ourAddressIdx = ourAddress.Address.findIndex(e => e._id.equals(addressId));
const address = ourAddress.Address[ourAddressIdx];
address.country = req.body.country;
address.firstName = req.body.firstName,
address.lastName = req.body.lastName,
address.address = req.body.address,
address.landmark = req.body.landmark,
address.state = req.body.state,
address.zip = req.body.zip,
address.email = req.body.email,
address.phone = req.body.phone,
await ourAddress.save();
res.redirect('/myAddress')

}

//<!--------------------------My_Orders---------------------------------------------------->

const ITEMS_PER_PAGE = 10;  

const myOrders = async (req, res) => {
    try {
        const userData = await collection.findOne({ emailId: req.session.email });
        const userId = userData._id;

        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;

        const populatedOrders = await orderCollection
            .aggregate([
                { $match: { userId: userId } },
                { $unwind: "$items" },
                { $lookup: { from: "productdatas", localField: "items.productId", foreignField: "_id", as: "items.productData" } },{ $sort: { "_id": -1 }}
            ])
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

        if (populatedOrders.length < 1) {
            // console.log("populatedOrders:", JSON.stringify(populatedOrders[0].items, null, 2));
        }

        const totalOrders = await orderCollection.countDocuments({ userId: userId });

        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

        res.render('User/myOrders', { orderData: populatedOrders, currentPage, totalPages });
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
};


//<!--------------------------Orders_Details----------------------------------------------->

const orderDetails = async (req, res) => {
  const orderId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).send("You tried to mess with me. But I am not messable");
  }

  const orderData = await orderCollection.findById(orderId);
  if (!orderData) {
    return res.status(404).send("Order not found.");
  }
 

  console.log(req.params);
  console.log("This is orderId : ", orderId);

  const userData = await collection.findOne({ emailId: req.session.email });
  const subId = orderData.selectedAddress
  const userId = userData._id;
  const address = await addressCollection.findOne({userId})
  const addressIndex = address.Address.findIndex(e => e._id.toString() === subId.toString())
   const addressDetails = address.Address[addressIndex]
  



  const orderProducts = await getProductDetails(orderData.items);
  res.render('User/orderDetails', { orderData, orderProducts , userData,addressDetails });
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

//<!-----------------------------change-Password---------------------------------->

const changePassword = (req,res) => {
  res.render('User/changePassword')
}


const changePasswordPost = async (req, res) => {
  try {
    const data = req.body;
    const userData = await collection.findOne({ emailId: req.session.email });
    console.log("Data:", data);
    console.log("UserData:", userData);
    console.log("pass:", data.newPass, userData.password);

    const isValid = await bcrypt.compare(data.oldPass, userData.password);

    if (!isValid) {
      const msg = 'Old password is incorrect';
      return res.render('User/changePassword',{msg}) 
      
    }

    if (data.newPass !== data.confPass) {
      const msg = 'Incorrect password'
      return res.render('User/changePassword',{msg})
    }

    const hashedPassword = await bcrypt.hash(data.newPass, 10);
    await collection.updateOne({ emailId: req.session.email }, { $set: { password: hashedPassword } });

    console.log('Password Changed Successfully!!');
    console.log("OldPass:", data.oldPass);
    console.log("NewPass:", data.newPass);
    const msg = 'Password Changed successfully'


    const successMsg = 'Password Changed successfully';
    return res.render('User/changePassword', { successMsg });
   } catch (err) {
    console.error(err);
    const msg = 'Internal server error'
    return res.render('User/changePassword', {msg})
};


}

const cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await orderCollection.findById(orderId);
    console.log("cancelled order is :",order.paymentMethod)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    // Check if the payment method is netbanking
    if (order.paymentMethod === 'NetBanking') {
      // Credit the order amount to the user's wallet
      const user = await collection.findById(order.userId).populate('wallet');
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
        

      // Update the wallet balance and add a credit transaction
      const creditAmount = order.orderTotal;
      user.wallet.balance += creditAmount;
      user.wallet.transactions.push({
        amount: creditAmount,
        type: 'Credit',
        date: new Date(),
      });
       
      // Save the updated user and wallet
      await user.wallet.save();
    }

    // Update the order status to 'Cancelled'
    const updatedOrder = await orderCollection.findByIdAndUpdate(
      orderId,
      { status: 'Cancelled', isCancelled: true },
      { new: true }
    );

    res.json({ success: true, updatedOrder });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

//<!--------------------------------Download Invoice---------------------------------->

const downloadInvoice=async (req, res) => {
  console.log("InsideDownloadInvoice")
  const orderId = req.params.orderId;
  console.log("orderID:",orderId)
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).send("Not a valid objectId");
  }
  const orderData = await orderCollection.findById(orderId);
  if (!orderData) {
    return res.status(404).send("Order not found.");
  }
 

  console.log(req.params);
  console.log("This is orderId : ", orderId);
  console.log("Order Data : ", orderData);

  const userData = await collection.findOne({ emailId: req.session.email });
  const subId = orderData.selectedAddress
  const userId = userData._id;
  const address = await addressCollection.findOne({userId})
  const addressIndex = address.Address.findIndex(e => e._id.toString() === subId.toString())
   const addressDetails = address.Address[addressIndex]
  console.log("addr:",addressDetails)
  const orderProducts = await getProductDetails(orderData.items);
  console.log("ord Pro:",orderProducts)
  console.log("the order data for invoice is :",orderData)
   res.json ({orderData, orderProducts , userData,addressDetails });
};

 
 

module.exports = { 
    profile,  
    myAddress,
    addAddress,
    AddressPost,
    deleteAddress,
    editAddress,
    editAddressPost,
    myOrders,
    orderDetails,
    changePassword,
    changePasswordPost,
    cancelOrder,
    downloadInvoice,
    
    
}