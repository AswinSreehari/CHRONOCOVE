const addressCollection = require('../models/address')
const collection = require('../models/user')
const cartCollection = require('../models/cart')
 




const profile = (req,res)=>{
    res.render('User/profile')
}

const myAddress = async(req,res) => {
    const userData = await collection.findOne({ emailId: req.session.email });
    const address  = await addressCollection.find({ userId: userData._id });
    console.log("address:",address)
    res.render('User/myAddress',{address})

}

const addAddress = (req,res) =>{
    res.render('User/addAddress')
}
const AddressPost = async(req,res)=>{
    
    const userData = await collection.findOne({ emailId: req.session.email });
      
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

    res.redirect('/myAddress')
    }catch(error){
        console.log('Error adding address:',error)
        res.redirect('/error')
    }
}

//<!----------------------------Delete_Address---------------------------------------->

const deleteAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
      const userData = await collection.findOne({ emailId: req.session.email });
      const userAddress = await addressCollection.findOne({ userId: userData._id });
      if (!userAddress) {
        return res.status(404).json({ message: "Address Not Found", success: false });
      }
      const addressIndex = userAddress.Address.findIndex(
        (addr) => addr._id.toString() === addressId.toString()
      );
      if (addressIndex === -1) {
        return res.status(404).json({ message: "Address not found in user's address list", success: false });
      }
      userAddress.Address.splice(addressIndex, 1);
      await userAddress.save();
      res.status(204).send(); 
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  };
// <!----------------------------Edit_Address-------------------------------------------->

const editAddress = (req,res) =>{
    res.render('User/editAddress')
}

module.exports = {
    profile,
    myAddress,
    addAddress,
    AddressPost,
    deleteAddress,
    editAddress
    
}