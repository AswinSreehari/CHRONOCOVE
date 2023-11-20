const express = require('express');
const router = express.Router();

const adminController = require('../controller/AdminController')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('/viewsUser/index');
// });

router.get('/signin',adminController.signin)
router.post('/signinPost',adminController.signinPost)
router.get('/dashboard',adminController.Dashboard),
router.get('/signout',adminController.signout)
router.get('/usermanagement',adminController.usermanagement)
router.get('/categorymanagement',adminController.categorymanagement)
router.get('/productmanagement',adminController.productmanagement)
router.get('/blank',adminController.blank)
router.get('/error',adminController.error)


module.exports = router;
