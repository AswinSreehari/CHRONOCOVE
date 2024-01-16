const mongoose = require('mongoose')
const productCollection = require('../models/product')
const userCollection = require('../models/user')
const wishlistCollection = require('../models/wishlist')
const { addToCart } = require('./cartController');
const { collection } = require('../models/cart')
const cartCollection = require('../models/cart')

const wishlist = async (req, res) => {
  try {
    const userData = await userCollection.find({ emailId: req.session.email })
     const wishData = await wishlistCollection.find(userData._id)
     const productIds = wishData.map(item => item.productId);
    const products = await productCollection.find({ _id: { $in: productIds } });
    console.log("products:", products)

    const wishNo = wishData.length;
    console.log("Wish Count:",wishNo)

    //Cart Icon Values
    const cartData = await cartCollection.findOne(userData._id);
    console.log('cartData:', cartData);
    const cartNo = cartData.items.length;
    console.log("Cart items count:",cartNo)
     

    res.render('User/wishlist', { products , cartNo , wishNo })
  } catch (error) {
    console.log('Error : ', error)
    res.redirect('User/error')
  }
}
const addWish = async (req, res) => {
  const userData = await userCollection.findOne({ emailId: req.session.email })
  let wishData = await wishlistCollection.findOne({ userId: userData._id })
  const productId = req.params.id
  console.log('productId:', productId)
  const product = await productCollection.findOne({ _id: productId })

  wishData = new wishlistCollection({
    userId: userData._id,
    productId: productId,
  });
  await wishData.save();

  const wish = await wishlistCollection.findOne({ userId: userData._id })
  console.log("New wish data:", wish)
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




//<!-------------------------Add to Cart--------------------------------------->

const addtoCart = async (req, res) => {
  const productId = req.params.id;
  console.log("productId is!", productId);
  try {
    const result = await addToCart(productId, req.session.email);
    if (result) {
      res.redirect('/cartGet');
    }
  } catch (err) {
    res.status(err.statusCode).send(err.message);
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

module.exports = {
  wishlist,
  addWish,
  deleteWishlistProduct,
  addtoCart
}