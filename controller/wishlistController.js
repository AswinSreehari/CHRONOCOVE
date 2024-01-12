const mongoose = require('mongoose')
const productCollection = require('../models/product')
const userCollection = require('../models/user')
const wishlistCollection = require('../models/wishlist')

const { collection } = require('../models/cart')
const cartCollection = require('../models/cart')

const wishlist = async (req, res) => {
  try {
    const userData = await userCollection.find({ emailId: req.session.email })
    console.log("This is the user: ", userData)
    const wishData = await wishlistCollection.find(userData._id)
    console.log("wishData:", wishData)
    const productIds = wishData.map(item => item.productId);
    const products = await productCollection.find({ _id: { $in: productIds } });
    console.log("products:", products)

    //Cart Icon Values
    const cartData = await cartCollection.findOne(userData._id);
    console.log('cartData:', cartData);
    const cartNo = cartData.items.length;
    console.log("Cart items count:",cartNo)
     

    res.render('User/wishlist', { products , cartNo })
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

  // Does product already exist in cart?
  // Increase Qty
  // Else
  // Add item to cart with qty 1

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
        totalPrice: product.productPrice,
      })

    }

    const populatedCart = await populateProductDetails(userCart);
    console.log(JSON.stringify(populatedCart, null, 2))
    const totalPrice = await cartCollection.aggregate([{ $match: { userId: userData._id } }, { $unwind: "$items" }, { $lookup: { from: "productdatas", localField: "items.productId", foreignField: "_id", as: "cartProduct" } }, { $project: { userId: 1, items: 1, productPrice: { $arrayElemAt: ["$cartProduct.productPrice", 0] }, calculatedPrice: { $multiply: ["$items.quantity", { $arrayElemAt: ["$cartProduct.productPrice", 0] }] } } }, { $group: { _id: "$items.productId", userId: { $first: "$userId" }, quantity: { $sum: "$items.quantity" }, totalPrice: { $sum: "$calculatedPrice" }, productPrice: { $first: "$productPrice" } } }]);
    const total = totalPrice.reduce((sum, item) => sum + item.totalPrice, 0);
    userCart.totalPrice = total
    console.log("Tot:", userCart.totalPrice)
    await userCart.save();
    res.render('User/cart', { populatedCart: populatedCart ?? [], totalPrice, total });
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

module.exports = {
  wishlist,
  addWish,
  deleteWishlistProduct,
  addtoCart
}