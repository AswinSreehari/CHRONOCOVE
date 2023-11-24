var express = require('express');
var router = express.Router();
const userController = require('../controller/UserController')


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

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


 


module.exports = router;
