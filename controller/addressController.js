const addressCollection = require('../models/address')

const checkout = ((req,res)=>{
    res.render('User/checkout')
})

const addAddress = async(req,res)=>{
    const addressData = {
        country: req.body.country,
        fname: req.body.fname,
        lname: req.body.lname,
        address: req.body.address,
        state: req.body.state,
        zip: req.body.zip,
        email:req.body.email,
        phone: req.body.phone

    }
    console.log("Address:",addAddress)
    try {
        await addressCollection.create(addressData);
        res.render('User/checkout');
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).send('Internal Server Error');
    }
}

const thankyou = ((req,res)=>{
 res.render('User/thankyou')
})

module.exports = {
    checkout,
    addAddress,
    thankyou
}
