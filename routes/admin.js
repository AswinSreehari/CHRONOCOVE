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
router.get('/addCategory',adminController.addCategory)
router.post('/categorymanagement',adminController.addCategoryPost)
router.get('/editCategory/:id',adminController.editCategory)
router.post('/editCategoryPost/:id',adminController.editCategoryPost)
router.get('/deleteCategory/:id',adminController.deleteCategory)
router.get('/addProducts',adminController.addProducts)
router.post('/addProductsPost',adminController.addProductsPost)
router.get('/editProduct/:id',adminController.editProduct)
router.post('/editProductPost/:id',adminController.editProductPost)
router.get('deleteProduct/:id',adminController.deleteProduct)


module.exports = router;
