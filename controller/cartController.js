const cartCollection = require('../models/cart')
const productCollection = require('../models/product')
const collection = require('../models/user')
const mongoose = require('mongoose')


  

const cart = async (req, res) => {
    const userEmail = req.session.email;
    const productId = req.params.id;
    const product = await productCollection.findById(productId);
  
    if (!product) {
      return res.status(404).send('Product Not Found!!');
    }
  
    const userData = await collection.findOne({ emailId: req.session.email });
    console.log("UserData:", userData);
  
    // try {
      let userCart = await cartCollection.findOne({ userId: userData._id });
  console.log("helooooooooooooooooooooo",userCart);
      if (!userCart) {
        const newCart = new cartCollection({
          userId: userData._id,
          items: [{
            productId: product._id,
            quantity: 1
          }],
          totalPrice: product.productPrice 
        });
  
        userCart = await newCart.save();
      } else {
        const existingItem = userCart.items.find(item => item.productId.equals(product._id));
        if (existingItem) {
          existingItem.quantity += 1;
          console.log("Product Price!!!!!!!!!!!!!!!!!!!!!:", product.productPrice);
          console.log("Existing Item Quantity!!!!!!!!!!!!!!!!!:", existingItem.quantity);

          
          userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.totalPrice || 0), 0);

        } else {
          userCart.items.push({
            productId: product._id,
            quantity: 1,
          });
          userCart.totalPrice = product.productPrice * userCart.quantity 
          await userCart.save();
        }
      }
  
      const populatedCart = await populateProductDetails(userCart);
  
      console.log("Populated Cart:", populatedCart);
  
      res.render('User/cart', { populatedCart });
    // } catch (error) {
    //   console.error("Error in cart route:", error);
    //   res.redirect('/error');
    // }
  }  
 
 const populateProductDetails = async function (cart) {
    if (!cart || !cart.items) {
      return null; 
    }
  
    const populatedItems = await Promise.all(cart.items.map(async (item) => {
      const product = await productCollection.findById(item.productId, {
        productName: 1,
        mainProductImage: 1,
        productPrice: 1,
      });
  
      return {
        productId: item.productId,
        quantity: item.quantity,
        productName: product.productName,
        mainProductImage: product.mainProductImage,
        productPrice: product.productPrice,
      };
    }));
  
    return {
      _id: cart._id,
      userId: cart.userId,
      totalPrice: cart.totalPrice,
      items: populatedItems,
    };
  };
  

  const cartGet = async(req, res) => {
    try {
    const userData = await collection.findOne({ emailId: req.session.email });
      let userCart = await cartCollection.findOne({ userId: userData._id });
      const populatedCart = await populateProductDetails(userCart);
      res.render('User/cart',{populatedCart});
    } catch (error) {
      console.log(error);
      res.redirect('/error');
    }
  };

  
  
module.exports = {
    cart,
    cartGet
}  