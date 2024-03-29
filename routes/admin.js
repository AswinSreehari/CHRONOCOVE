const express = require('express');
const router = express.Router();
const multer = require('multer')

const adminController = require('../controller/AdminController')
const productController = require('../controller/ProductController')
const categoryController = require('../controller/CategoryController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
const chartController = require('../controller/chartController')
const storage = require('../storage/multer')
const upload = multer({storage})

const adminauthenticaton = require("../middleware/adminAuth")

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('/viewsUser/index');
// });

router.get('/signin',adminController.signin)
router.post('/signinPost',adminController.signinPost)
router.get('/dashboard',adminauthenticaton.adminauthenticaton,adminController.Dashboard),
router.get('/signout',adminController.signout)
router.get('/usermanagement',adminauthenticaton.adminauthenticaton,adminController.usermanagement)
router.get('/categorymanagement',adminauthenticaton.adminauthenticaton,categoryController.categorymanagement)
router.get('/productmanagement',adminauthenticaton.adminauthenticaton,productController.productmanagement)
router.get('/blank',adminController.blank)
router.get('/error',adminController.error)
router.get('/addCategory',adminauthenticaton.adminauthenticaton,categoryController.addCategory)
router.post('/categorymanagement',adminauthenticaton.adminauthenticaton,categoryController.addCategoryPost)
router.get('/editCategory/:id',adminauthenticaton.adminauthenticaton,categoryController.editCategory)
router.post('/editCategoryPost/:id',adminauthenticaton.adminauthenticaton,categoryController.editCategoryPost)
router.get('/deleteCategory/:id',adminauthenticaton.adminauthenticaton,categoryController.deleteCategory)
router.get('/addProducts',adminauthenticaton.adminauthenticaton,productController.addProducts)
router.post('/addProductsPost',adminauthenticaton.adminauthenticaton,upload.fields(
    [
        { name: 'mainProductImage', maxCount: 1 },
        { name: 'additionalProductImage', maxCount: 3 }
    ]),productController.addProductsPost)
router.get('/editProduct/:id',productController.editProduct)
router.post('/editProductPost/:id',upload.fields(
    [
        { name: 'mainProductImage', maxCount: 1 },
        { name: 'additionalProductImage', maxCount: 3 }
    ]),productController.editProductPost)


router.get('/deleteProduct/:id',adminauthenticaton.adminauthenticaton,productController.deleteProduct)
router.get("/block/:id",adminauthenticaton.adminauthenticaton,adminController.blockUser)
router.get("/unblock/:id",adminauthenticaton.adminauthenticaton,adminController.unblockUser)
router.delete('deleteProductImage/:id/:mainProductImage',productController.deleteProductImage)


//orderManagement

router.get('/ordermanagement',adminauthenticaton.adminauthenticaton,orderController.orderManagement)
router.get('/AdminViewOrderDetails/:id',adminauthenticaton.adminauthenticaton,orderController.AdminViewOrderDetails)
router.put('/orderStatus/:id',adminauthenticaton.adminauthenticaton,orderController.orderStatus)

//Coupon

router.get('/couponManagement',adminauthenticaton.adminauthenticaton,couponController.couponManagement);
router.get('/addCoupons',adminauthenticaton.adminauthenticaton,couponController.addCouponGet)
router.post('/addCoupons',adminauthenticaton.adminauthenticaton,couponController.addCoupon)
router.get('/delete-coupon/:couponId',adminauthenticaton.adminauthenticaton,couponController.deleteCoupon);


//route for category offer


router.post('/applyOffer',adminauthenticaton.adminauthenticaton, categoryController.applyOffer);
router.get('/sendCategoryOffer', adminauthenticaton.adminauthenticaton,categoryController.sendCategoryOffer);

//route for chart for admin
router.get("/chartData",adminauthenticaton.adminauthenticaton,chartController.chart)

module.exports = router;
