const collection = require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const productCollection = require('../models/product');
const cartCollection = require('../models/cart')
const addressColleciton = require('../models/address')
const mongoose = require('mongoose')
 
 

const passwordcrypt = async function (password) {
    const bcrptPass = await bcrypt.hash(password, 8);
    return bcrptPass;
  }

// function for generating otp
const generateOTP = () => {
    // generating a 6 digit otp number   
    return Math.floor(1000 + Math.random() * 900000); 
  };
  
  
  const sendOTPByEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, //
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
  
    const mailOptions = {
      from: process.env.EMAIL_ID, // me/admin
      to: email, // user email
      subject: 'OTP verification',//subject
      html: `<h2> OTP Verifictaion</h2>
        <p>Your OTP for verification is:  </p>
         <h3> Your OTP is: ${otp}</h3>`, //passing otp with email
    };
  
    // Sending   email
    try {
      const info = await transporter.sendMail(mailOptions)
  
      console.log('Email sent:' + info.response)
    } catch (err) {
       console.log("Error Sending mail : ",err)
       res.redirect('/error')
   }
  }


const home = async(req,res)=>{
    try{
    const products = await productCollection.find({isDeleted:false})
    const email = req.session.email
    if(req.session.user)
    {
      user= true;
       res.render('User/index',{email,products,user})
      console.log("home products :",products)
  
    }else{
       user = false;
       res.render('User/index',{email,products,user})
    }
    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
     
}
//SignUp 

const signup = (req,res)=>{
    res.render('User/signup')
} 
 

const signupPost = async (req, res) => {
    let email = req.body.email;
    const userFound = await collection.findOne({ emailId: email });

    if (userFound) {
        const msg = "Email is already Registered";
        res.render("User/signup", { msg });
        console.log("Inside user found!!");
    } else {
        try {
            const { otp, otpExpiry } = generateOTPWithExpiry();
            console.log(otp);

            const data = {
                username: req.body.name,
                emailId: req.body.email,
                password: await passwordcrypt(req.body.password),
                otp: otp,
                otpExpiry: otpExpiry,
            };

            await collection.create(data);

            const check = await collection.findOne({ emailId: req.body.email });

            if (check.isBlocked) {
                res.render("User/signIn", { error: "You are blocked by admin!!!" });
            }

            req.session.user = req.body.email;
            req.session.otp = otp;
            req.session.otpExpiry = otpExpiry;
            req.session.requestedOTP = true;
            await sendOTPByEmail(req.body.email, otp);
            res.render("User/otp", {
                msg: "Please enter the OTP sent to your email",
            });

        } catch (error) {
            console.error(error);
            res.redirect('/error');
        }
    }
};


//SignIn

const signIn = (req,res)=>{
    if(req.session.email){
        res.redirect('/')
    }else{
         res.render('User/signIn')
    } 
}

const signInPost = async (req, res) => {
  console.log("inside signinPost  ");
  const email = req.body.email;
  console.log("email is:", email);

  try {
      console.log("inside try");
      const check = await collection.findOne({ emailId: email });
      console.log("checked user", check);

      if (!check) {
          console.log("User name cannot be found");
      } else {
          if (check.isBlocked) {
              return res.render('User/signin', { error: "You are blocked by admin" });
          }

          const isPasswordmatch = await bcrypt.compare(req.body.password, check.password);

          if (isPasswordmatch) {
              req.session.email = check.emailId;
              req.session.user= req.session.email
              console.log(req.session.email);
              return res.redirect("/");
          } else {
              const error = "Invalid Details";
              return res.render('User/signin', { error });
          }
      }
  } catch (error) {
      console.error("Error during SignIn:", error);
      return res.redirect('/error');
  }
};


//Signout

const signOut=(req,res)=>{
    req.session.destroy((error)=>{
        console.log("error in destroying session");
        if(error){
            res.send("session destroyed!!")
        }else{
            res.redirect("/")
        }
    })
}



//function for verifying otp
const verifyOTP = async (req, res) => {
    const enteredOTP = parseInt(req.body.otp, 10);
    const storedOTP = parseInt(req.session.otp, 10);
    const otpExpiry = req.session.otpExpiry;
    console.log('correct otp:',storedOTP)
    console.log('entered otp:', enteredOTP)

    if (new Date() > new Date(otpExpiry)) {
        return res.json({ isValid: false, msg: "OTP has expired. Please request a new one." });
    }

    try {
        const user = await collection.findOne({ emailId: req.session.user });

        if (!user) {
            return res.json({ isValid: false, msg: "User not found" });
        }

        if (user.isBlocked) {
            return res.json({
                isValid: false,
                msg: "Your account has been blocked. Please contact support.",
            });
        }

        if (enteredOTP === storedOTP) {
            return res.json({ isValid: true });
        } else {
            return res.json({ isValid: false, msg: "Invalid OTP. Please try again" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isValid: false, msg: "An error occurred during OTP verification." });
    }
};


  const resendOTP = async (req, res) => {

    const usermail = req.session.user
    if (req.session.requestedOTP) {
      const {otp, otpExpiry} = generateOTPWithExpiry()
      console.log("otp generated for resend is :", otp);
      req.session.otp = otp;
      req.session.otpExpiry = otpExpiry;
      await sendOTPByEmail(usermail, otp);
      res.json({ msg: "otp have been resented to your email " })
    } else {
      res.json({ msg: "can't send otp now" })
    }
  
  };

//   OTP_Expiry

  const generateOTPWithExpiry = () => {
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 1);  
    return { otp, otpExpiry };
};


  //Product_Details

const productDetails = (async(req,res)=>{
  const productId = req.params.id
  try{
    const products = await productCollection.findById(productId)
  res.render('User/product_details',{products})
  console.log("this is the products:",products)
  }catch(error){
    console.log(error)
    res.redirect("/error")
  }
})






//About

const about = ((req,res)=>{
    res.render('User/about')
})

//404_Error

const error = ((req,res)=>{
    res.render('User/404')
})


const contact = ((req,res)=>{
    res.render('User/contact')
})

module.exports={
    home,
    signup,
    signupPost,
    signIn,
    signInPost,
    signOut,
    about,
    error,
    verifyOTP,
    resendOTP,
    productDetails,
    generateOTPWithExpiry,
    contact,
}