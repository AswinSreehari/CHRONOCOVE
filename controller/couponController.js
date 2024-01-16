const couponCollection = require('../models/coupon')
const collection = require('../models/user')

const ITEMS_PER_PAGE = 6;  
const couponManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const totalCoupons = await couponCollection.countDocuments();
        const totalPages = Math.ceil(totalCoupons / ITEMS_PER_PAGE);

        const coupons = await couponCollection.find().skip(skip).limit(ITEMS_PER_PAGE);

        res.render('admin/CouponManagement', { coupons, currentPage: page, totalPages });
    } catch (error) {
        console.error(error);
        res.json("Internal server error");
    }
};


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
        const existingCoupon = await couponCollection.findOne({ couponName });

        if (existingCoupon) {
             console.log("Coupon already exists!");
              return res.status(400).send("Coupon already exist!!")
 
          } else {
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
        }

        
    } catch (error) {
        console.log(error)
        res.redirect('/error')
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
        console.log("Inside Apply Couponsss!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      // Get the coupon code and total price from the request body
      let { couponCode, total } = req.body;
      console.log("ReqBody::",req.body)
        console.log("req.body:",couponCode , total)
         
      // Find the coupon data by coupon code
      const couponData = await couponCollection.findOne({ couponName: couponCode });
        console.log("CouponData:",couponData)
      // Check if the coupon is expired
      const currentDate = new Date();
      if (couponData.expiryDate && couponData.expiryDate < currentDate) {
        return res.status(400).json({ error: 'Coupon has expired' });
      }
  
      // Check if the total price is greater than the minimum value of the coupon
      if (Number(total) < couponData.minValue) {
        return res.status(400).json({ error: 'Total price is less than the minimum value required for this coupon' });
      }
      console.log('total price',total);
      // Calculate coupon discount and grant total
      const couponDiscount = Math.floor((Number(total) * couponData.couponValue) / 100);
        total = Number(total) - couponDiscount;
  
       const user = await collection.findOne({emailId: req.session.email });
      const userId = user._id;  
      console.log("UserId:",userId);
      if (!couponData.appliedUsers.includes(userId)) {
         couponData.appliedUsers.push(userId);
  
         await couponData.save();
      }
      console.log("Grand Total:",total)
      console.log("coupon discount is :",couponDiscount)
      res.json({ total, couponDiscount });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  const removeCoupon = async (req, res) => {
    try {
      
      const { total } = req.body;
  
     
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
      console.log("total price is :",total);
      
      const couponDiscount = Math.floor((total * couponData.couponValue) / 100);
       total = total - couponDiscount;
      // totalPrice= totalPrice;
      console.log("new total is :",total);
      console.log("totalPrice is :",total);
  
     
      await couponData.save();
  
      res.json({ total, couponDiscount });
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