var express = require('express');
var router = express.Router();
const userController = require('../controller/UserController')
const productController = require('../controller/ProductController')
const userAuthentication = require('../middleware/userAuth')
const cartController = require('../controller/cartController')
const checkoutController = require('../controller/checkoutController');
const profileController = require('../controller/profileController')
const orderController = require('../controller/orderController')
const cartCollection = require('../models/cart');
const wishlistController = require('../controller/wishlistController');
const walletcontroller = require('../controller/walletController')
const hpp = require('hpp');


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

//<---------------------------User_Route------------------------------>

router.get('/',userController.home)
router.post('/signup',userController.signupPost)
router.get('/signup',userController.signup)
router.get('/signin',userController.signIn)
router.post('/signin',userController.signInPost)
router.get('/google-signin/callback', userController.googleSignIn);
router.get('/signout',userController.signOut)
router.get('/about',userController.about)
router.get('/error',userController.error)
router.post('/verifyOTP',userController.verifyOTP)
router.post("/resendOTP",userController.resendOTP)
router.get("/productDetails/:id",userController.productDetails)
router.get('/contact',userController.contact)
router.get('/forgotPassword',userController.forgotPassword)
router.post('/forgotPasswordPost',userController.forgotPasswordPost)


//<-----------------------------Product_Route----------------------------->

router.get('/shop',productController.shop)


//<------------------------------Cart_Route--------------------------------------------->

router.get('/cartGet',userAuthentication.userAuthentication,cartController.cartGet)
router.post("/cart/:id",userAuthentication.userAuthentication,cartController.cart)
router.put('/cart/:productId',userAuthentication.userAuthentication,cartController.updateQty)
router.delete('/cart/:productId',userAuthentication.userAuthentication,cartController.deleteCartproduct)


//<------------------------------Checkout_Address_Route------------------------------------------>
// hpp({ whitelist: ['productId']})
router.get('/checkout',  userAuthentication.userAuthentication,checkoutController.checkout)
router.post('/checkoutPost',userAuthentication.userAuthentication,orderController.checkoutPost)
router.post('/addAddressPost',userAuthentication.userAuthentication ,checkoutController.addAddressPost)
router.get('/thankyou',userAuthentication.userAuthentication,checkoutController.thankyou)


//<---------------------------------User_Profile----------------------------------------->

router.get('/profile',userAuthentication.userAuthentication,profileController.profile)
router.get('/myAddress',userAuthentication.userAuthentication,profileController.myAddress)
router.get('/addAddress',userAuthentication.userAuthentication,profileController.addAddress)
router.post('/AddressPost',userAuthentication.userAuthentication,profileController.AddressPost)
router.delete('/deleteAddress/:id',userAuthentication.userAuthentication,profileController.deleteAddress)
router.get('/editAddress/:id',userAuthentication.userAuthentication,profileController.editAddress)
router.post('/editAddressPost/:id',userAuthentication.userAuthentication,profileController.editAddressPost)
router.get('/myOrders',userAuthentication.userAuthentication,profileController.myOrders)
router.get('/orderDetails/:id',userAuthentication.userAuthentication,profileController.orderDetails)
router.get('/changePassword',userAuthentication.userAuthentication,profileController.changePassword)
router.post('/changePasswordPost',userAuthentication.userAuthentication,profileController.changePasswordPost)
router.put('/cancelOrder/:orderId',userAuthentication.userAuthentication,profileController.cancelOrder)

//<---------------------------------Wishlist----------------------------------------->
router.get('/wishlist', userAuthentication.userAuthentication,wishlistController.wishlist);
router.post('/addWish/:id',userAuthentication.userAuthentication,wishlistController.addWish)
router.delete('/wishlist/:productId',userAuthentication.userAuthentication,wishlistController.deleteWishlistProduct)
router.post('/addtoCart/:id',userAuthentication.userAuthentication,wishlistController.addtoCart)

//<---------------------------------Wallet----------------------------------------->

 router.get('/walletHistory',userAuthentication.userAuthentication,walletcontroller.walletHistory)





module.exports = router;
