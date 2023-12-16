const orderCollection = require('../models/order')



const orderManagement = (req,res)=>{
    
    
    res.render('Admin/orderManagement')
  }

  module.exports = {
    orderManagement
  }