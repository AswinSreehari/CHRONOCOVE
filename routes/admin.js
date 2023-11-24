const express = require('express');
const router = express.Router();
const multer = require('multer')

const adminController = require('../controller/AdminController')
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
router.get('/categorymanagement',adminauthenticaton.adminauthenticaton,adminController.categorymanagement)
router.get('/productmanagement',adminauthenticaton.adminauthenticaton,adminController.productmanagement)
router.get('/blank',adminController.blank)
router.get('/error',adminController.error)
router.get('/addCategory',adminauthenticaton.adminauthenticaton,adminController.addCategory)
router.post('/categorymanagement',adminauthenticaton.adminauthenticaton,adminController.addCategoryPost)
router.get('/editCategory/:id',adminauthenticaton.adminauthenticaton,adminController.editCategory)
router.post('/editCategoryPost/:id',adminauthenticaton.adminauthenticaton,adminController.editCategoryPost)
router.get('/deleteCategory/:id',adminauthenticaton.adminauthenticaton,adminController.deleteCategory)
router.get('/addProducts',adminauthenticaton.adminauthenticaton,adminController.addProducts)
router.post('/addProductsPost',adminauthenticaton.adminauthenticaton,upload.fields(
    [
        { name: 'mainProductImage', maxCount: 1 },
        { name: 'additionalProductImage', maxCount: 3 }
    ]),adminController.addProductsPost)
router.get('/editProduct/:id',adminController.editProduct)
router.post('/editProductPost/:id',upload.fields(
    [
        { name: 'mainProductImage', maxCount: 1 },
        { name: 'additionalProductImage', maxCount: 3 }
    ]),adminController.editProductPost)


router.get('/deleteProduct/:id',adminauthenticaton.adminauthenticaton,adminController.deleteProduct)
router.get("/block/:id",adminauthenticaton.adminauthenticaton,adminController.blockUser)
router.get("/unblock/:id",adminauthenticaton.adminauthenticaton,adminController.unblockUser)


module.exports = router;
