const mongoose = require('mongoose')
const productCollection = require('../models/product')
const userCollection = require('../models/user')
const wishlistCollection = require('../models/wishlist')

const { collection } = require('../models/cart')

const wishlist = async(req,res) => {
    try{
        const userData = await userCollection.find({emailId:req.session.email})
        console.log("This is the user: ",userData)
        const wishData = await wishlistCollection.find(userData._id)
        console.log("wishData:",wishData) 
        const productIds = wishData.map(item => item.productId);
        const products = await productCollection.find({ _id: { $in: productIds } });
                console.log("products:",products)
       
        
        res.render('User/wishlist',{products})
    }catch(error){
        console.log('Error : ',error)
        res.redirect('User/error')
    }
}
const addWish = async(req,res) => {
    const userData = await userCollection.findOne({emailId:req.session.email})
    let wishData = await wishlistCollection.findOne({userId:userData._id})
    const productId = req.params.id 
    console.log('productId:',productId)
    const product =await productCollection.findOne({_id:productId})
    
        wishData = new wishlistCollection({
            userId: userData._id,
            productId: productId ,
        });
        await wishData.save();
    
    const wish = await wishlistCollection.findOne({userId:userData._id})
    console.log("New wish data:",wish)
}

//<!-------------------------delete Wishlist Product---------------------------------->

const deleteWishlistProduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      const result = await wishlistCollection.deleteOne({ productId: productId });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ success: true, message: 'Product deleted from wishlist.' });
      } else {
        res.status(404).json({ success: false, message: 'Product not found in the wishlist.' });
      }
    } catch (error) {
      console.error('Error deleting product from wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };


module.exports ={
    wishlist,
    addWish,
    deleteWishlistProduct
}