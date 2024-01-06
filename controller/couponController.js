const couponCollection = require('../models/coupon')

const couponManagement = async (req,res) => {
    try{ const coupons= await couponCollection.find()
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


module.exports = {
    couponManagement,
    addCouponGet,
    addCoupon,
    deleteCoupon
}