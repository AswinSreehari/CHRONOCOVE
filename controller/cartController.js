const cartCollection = require('../models/cart')
const productCollection = require('../models/product')
const collection = require('../models/user')
const mongoose = require('mongoose')


  

const cart = async (req, res) => {

  // Does product already exist in cart?
    // Increase Qty
  // Else
    // Add item to cart with qty 1
  
    const userEmail = req.session.email;
    const productId = req.params.id;
    const product = await productCollection.findById(productId);
    if (!product) {
      return res.status(404).send('Product Not Found!!');
    }
  
    const userData = await collection.findOne({ emailId: req.session.email });

    try {
      let userCart = await cartCollection.findOne({ userId: userData._id });
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
      }

      const existingItemIndex = userCart.items.findIndex(item => item.productId.equals(product._id));
      if (existingItemIndex !== -1) {
        userCart.items[existingItemIndex].quantity += 1;
        userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.totalPrice || 0), 0);
      } else {
        userCart.items.push({
          productId: product._id,
          quantity: 1,
        });
        userCart.totalPrice = product.productPrice 
      }
      await userCart.save();

      const populatedCart = await populateProductDetails(userCart);
      res.render('User/cart', { populatedCart });
    } catch (err) {
      console.error("Error at god knows where.");
      console.error(err);
      res.redirect('/error');
    }
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
  }

  

  const updateQty = async(req,res)=>{
    try{
     const productId = req.params.productId
     const product = await productCollection.findById(productId)
    if(!product){
      return res.status(404).json({meassage: "product Don't exist!!",success: false})
    }
    const newQuantity = parseInt(req.body.quantity)

    if(newQuantity > product.productQuantity)
    return res.status(400).json({message: "Insufficent Stock!!", success:false})

    //Find the User Cart

    const userData = await collection.findOne({ emailId: req.session.email });
      let cartData = await cartCollection.findOne({ userId: userData._id });
      if(!cartData){
        return res.status(404).json({message: "Cart Not Found",success:false})
      }
      const populatedCart = await populateProductDetails(cartData);
      console.log("I am IronMan!:",populatedCart)
      const productInCartIndex = cartData.items.findIndex(prod => prod.productId.toString() === product._id.toString());
      if (productInCartIndex === -1) {
        return res.status(404).json({ message: "product not in user's cart "});
      }
  
      cartData.items[productInCartIndex].quantity = newQuantity;
      await cartData.save();
  
      res.status(202).json({ message: "success", success:true});
  
    
    }catch(error){
    console.error(error)
    res.status(500).json({message: "internal Server error"})
    }


  }

//Delete Product form the cart

const deleteCartproduct = async (req, res) => {
  try {
    const productId = req.params.productId;

 
    const userData = await collection.findOne({ emailId: req.session.email });
    let cartData = await cartCollection.findOne({ userId: userData._id });

    if (!cartData) {
      return res.status(404).json({ message: "Cart Not Found", success: false });
    }

 
    const productInCartIndex = cartData.items.findIndex(
      (prod) => prod.productId.toString() === productId.toString()
    );

    if (productInCartIndex === -1) {
      return res.status(404).json({ message: "Product not in user's cart", success: false });
    }
 
    cartData.items.splice(productInCartIndex, 1);
    await cartData.save();
    const populatedCart = await populateProductDetails(cartData);
    res.status(200).json({ message: "Product deleted from cart", success: true, cart: populatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }

};

  
module.exports = {
    cart,
    cartGet,
    updateQty,
    deleteCartproduct
}  