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
        const product = await productCollection.findOne({_id:wishData.productId})
        console.log("product:",product)
       
        
        res.render('User/wishlist',{wishData})
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
    if (!wishData) { 
        wishData = new wishlistCollection({
            userId: userData._id,
            productId: productId ,
        });

        await wishData.save();
    }
    const wish = await wishlistCollection.findOne({userId:userData._id})
    console.log("New wish data:",wish)
}

module.exports ={
    wishlist,
    addWish
}