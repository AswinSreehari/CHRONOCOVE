var express = require('express');
var router = express.Router();
const userController = require('../controller/User')

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
router.get('/about',userController.about)





module.exports = router;
