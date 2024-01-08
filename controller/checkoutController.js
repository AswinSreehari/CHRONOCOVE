const addressCollection = require('../models/address')
const collection = require('../models/user')
const cartCollection = require('../models/cart')
const productCollection = require('../models/product')
const couponCollection = require('../models/coupon')

const checkout = (async (req, res) => {
  const userData = await collection.findOne({ emailId: req.session.email });
  const userCart = await cartCollection.findOne({ userId: userData._id });
  const totalPrice = await cartCollection.aggregate([{ $match: { userId: userData._id } }, { $unwind: "$items" }, { $lookup: { from: "productdatas", localField: "items.productId", foreignField: "_id", as: "cartProduct" } }, { $project: { userId: 1, items: 1, productPrice: { $arrayElemAt: ["$cartProduct.productPrice", 0] }, calculatedPrice: { $multiply: ["$items.quantity", { $arrayElemAt: ["$cartProduct.productPrice", 0] }] } } }, { $group: { _id: "$items.productId", userId: { $first: "$userId" }, quantity: { $sum: "$items.quantity" }, totalPrice: { $sum: "$calculatedPrice" }, productPrice: { $first: "$productPrice" } } }]);

  console.log('Its the UserCart', userCart)
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
  const total = totalPrice.reduce((sum, item) => sum + item.totalPrice, 0);
  const userAddress = await addressCollection.find({ userId: userData._id })
  const populatedCart = await populateProductDetails(userCart);

  const currentDate = new Date()
  const coupons = await couponCollection.find({
    appliedUsers: { $nin: [userData._id] },
    expiryDate: { $gte: currentDate.toISOString() },
  })

  console.log("populatedCart:", populatedCart)
  res.render('User/checkout', { populatedCart, totalPrice, total, coupons, userAddress: userAddress ?? [] })
})

const addAddressPost = async (req, res) => {

  const userData = await collection.findOne({ emailId: req.session.email });
  let userCart = await cartCollection.findOne({ userId: userData._id });


  try {
    let userAddress = await addressCollection.findOne({ userId: userData._id })
    if (!userAddress) {
      const newAddress = new addressCollection({
        userId: userData._id,
        Address: [{
          country: req.body.country,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          address: req.body.address,
          landmark: req.body.landmark,
          state: req.body.state,
          zip: req.body.zip,
          email: req.body.email,
          phone: req.body.phone

        }]

      })
      userAddress = await newAddress.save()

    } else {
      userAddress.Address.push({
        country: req.body.country,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        landmark: req.body.landmark,
        state: req.body.state,
        zip: req.body.zip,
        email: req.body.email,
        phone: req.body.phone
      })
      userAddress.save()
    }

    const userAddresss = await addressCollection.find({ userId: userData._id })
    console.log("UserAddress", userAddresss)
    const totalPrice = await cartCollection.aggregate([{ $match: { userId: userData._id } }, { $unwind: "$items" }, { $lookup: { from: "productdatas", localField: "items.productId", foreignField: "_id", as: "cartProduct" } }, { $project: { userId: 1, items: 1, productPrice: { $arrayElemAt: ["$cartProduct.productPrice", 0] }, calculatedPrice: { $multiply: ["$items.quantity", { $arrayElemAt: ["$cartProduct.productPrice", 0] }] } } }, { $group: { _id: "$items.productId", userId: { $first: "$userId" }, quantity: { $sum: "$items.quantity" }, totalPrice: { $sum: "$calculatedPrice" }, productPrice: { $first: "$productPrice" } } }]);
    const total = totalPrice.reduce((sum, item) => sum + item.totalPrice, 0);
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

    const coupons = await couponCollection.find()
    const populatedCart = await populateProductDetails(userCart);
    res.render('User/checkout', { populatedCart, totalPrice, total, userAddress: userAddress, coupons });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).send('Internal Server Error');
  }
}

const thankyou = ((req, res) => {
  const orderId = req.params.id
  console.log("this is the orderId:", orderId)
  res.render('User/thankyou')
})







module.exports = {
  checkout,
  addAddressPost,
  thankyou,

}
