const addressCollection = require('../models/address')
const collection = require('../models/user')

const checkout = ((req,res)=>{
    res.render('User/checkout')
})

const addAddressPost = async(req,res)=>{
    
    const userData = await collection.findOne({ emailId: req.session.email });
    console.log("I AM IRONMAN:",userData)
    try {
        let userAddress = await addressCollection.findOne({ userId: userData._id })
    if(!userAddress){
        const newAddress = new addressCollection({
            userId: userData._id,
            Address:[{
                country: req.body.country,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                landmark: req.body.landmark,
                state: req.body.state,
                zip: req.body.zip,
                email:req.body.email,
                phone: req.body.phone

            }]
            
        })
        userAddress = await newAddress.save()
        
    }else{
        userAddress.Address.push({
            country: req.body.country,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                landmark: req.body.landmark,
                state: req.body.state,
                zip: req.body.zip,
                email:req.body.email,
                phone: req.body.phone
        })
        userAddress.save()
    }

        const userAddresss = await addressCollection.find({userId : userData._id}) 
       console.log("UserAddress",userAddresss)
        res.render('User/checkout',{userAddresss});

        
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
    addAddressPost,
    thankyou
}
