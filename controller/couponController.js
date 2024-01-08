const couponCollection = require('../models/coupon')
const collection = require('../models/user')

const couponManagement = async (req,res) => {
    try{ 
      const coupons= await couponCollection.find()
        console.log(coupons);
        res.render('admin/CouponManagement',{coupons})}
        catch(error)
        {
            console.log(error);
            res.json("internal server error")
        }
}

const addCouponGet = (req,res) => {
    res.render('admin/addCoupons')
}

const addCoupon = async (req, res) => {
    try {
        console.log("inside coupon Post!!");
        
        const { couponName, couponValue, maxValue, minValue, expiryDate } = req.body;
        console.log(couponName);
        console.log(maxValue);
        console.log(minValue);
        console.log(expiryDate);
        const newCoupon = new couponCollection({
            couponName,
            couponValue,
            maxValue,
            minValue,
            expiryDate,
        });
         
        console.log(newCoupon);
        await newCoupon.save();
        console.log("Coupon Saved!!");
        res.redirect('/admin/couponManagement'); 
    } catch (error) {
        console.log(error)
        res.redirect('admin/error')
    }
};



const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        console.log(couponId)
        await couponCollection.findByIdAndDelete(couponId);
        res.redirect('/admin/couponManagement'); 
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
};

//<!-------------------User_Coupon------------------------------------------>

const applyCoupon = async (req, res) => {
    try {
        console.log("Inside Apply Coupon!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      // Get the coupon code and total price from the request body
      let { couponCode, grandTotal } = req.body;
        console.log("req.body:",couponCode , grandTotal)
      // Find the coupon data by coupon code
      const couponData = await couponCollection.findOne({ couponName: couponCode });
        console.log("CouponData:",couponData)
      // Check if the coupon is expired
      const currentDate = new Date();
      if (couponData.expiryDate && couponData.expiryDate < currentDate) {
        return res.status(400).json({ error: 'Coupon has expired' });
      }
  
      // Check if the total price is greater than the minimum value of the coupon
      if (grandTotal < couponData.minValue) {
        return res.status(400).json({ error: 'Total price is less than the minimum value required for this coupon' });
      }
  
      // Calculate coupon discount and grant total
      const couponDiscount = Math.floor((grandTotal * couponData.couponValue) / 100);
        grandTotal = grandTotal - couponDiscount;
  
      // Assuming userId is available in your request or from your authentication system
      const user = await collection.findOne({emailId: req.session.email });
      const userId = user._id; // Adjust this based on how you store user information
  console.log(userId);
      if (!couponData.appliedUsers.includes(userId)) {
        // Push the user's ID to the appliedUsers array
        couponData.appliedUsers.push(userId);
  
        // Save the coupon data with the updated appliedUsers array
        await couponData.save();
      }
      console.log("Grand Total:",grandTotal)
      res.json({ grandTotal, couponDiscount });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  const removeCoupon = async (req, res) => {
    try {
      
      const { grandTotal } = req.body;
  
     
      const user = await collection.findOne({emailId: req.session.email });
      const userId = user._id; 
  
      // Find the coupon data that was previously applied to the user
      const couponData = await coupon.findOne({
        appliedUsers: userId,
      });
  
      // Check if the user has a coupon applied
      if (!couponData) {
        return res.status(400).json({ error: 'No coupon applied to the user' });
      }
  
      // Remove the user from the appliedUsers array
      const userIndex = couponData.appliedUsers.indexOf(userId);
      if (userIndex !== -1) {
        couponData.appliedUsers.splice(userIndex, 1);
      }
  
      // removing the coupon discount
      console.log("total price is :",grandTotal);
      
      const couponDiscount = Math.floor((grandTotal * couponData.couponValue) / 100);
       grandTotal = grandTotal - couponDiscount;
      // grandTotal= grandTotal;
      console.log("new grandTotal is :",grandTotal);
      console.log("grandTotal is :",grandTotal);
  
     
      await couponData.save();
  
      res.json({ grandTotal, couponDiscount });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


module.exports = {
    couponManagement,
    addCouponGet,
    addCoupon,
    deleteCoupon,
    applyCoupon,
    removeCoupon
}