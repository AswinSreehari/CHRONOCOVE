const express = require('express')
const router = express.Router()
const productController = require('../controller/ProductController')
const userAuthentication = require('../middleware/userAuth')






module.exports = router