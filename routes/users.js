var express = require('express');
var router = express.Router();
const userController = require('../controller/UserController')
const productController = require('../controller/ProductController')
const userAuthentication = require('../middleware/userAuth')
const cartController = require('../controller/cartController')
const addressController = require('../controller/addressController')


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

//<---------------------------User_Route------------------------------>

router.get('/',userController.home),
router.get('/signup',userController.signup),
router.get('/signin',userController.signIn),
router.post('/signup',userController.signupPost),
router.post('/signin',userController.signInPost),
router.get('/signout',userController.signOut),
router.get('/about',userController.about),
router.get('/error',userController.error),
router.post('/verifyOTP',userController.verifyOTP)
router.post("/resendOTP",userController.resendOTP)
router.get("/productDetails/:id",userController.productDetails)
router.get('/contact',userController.contact)


//<-------------------------Product_Route-------------------------->

router.get('/shop',productController.shop)


//<-------------------------Cart_Route----------------------------->

router.get('/cartGet',userAuthentication.userAuthentication,cartController.cartGet)
router.post("/cart/:id",userAuthentication.userAuthentication,cartController.cart)


//<-------------------------Address_Route----------------------------->

router.get('/checkout',addressController.checkout)
router.post('/checkoutPost',addressController.addAddress)
router.get('/thankyou',addressController.thankyou)




module.exports = router;
