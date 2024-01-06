const collection = require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const productCollection = require('../models/product');
const cartCollection = require('../models/cart')
const addressColleciton = require('../models/address')
const mongoose = require('mongoose');
const { getGoogleOAuthURL } = require('../utils/oauth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



const passwordcrypt = async function (password) {
    const bcrptPass = await bcrypt.hash(password, 8);
    return bcrptPass;
}


const generateOTP = () => {
    // generating a 6 digit otp number   
    // return Math.floor(1000 + Math.random() * 900000); 
    return crypto.randomInt(100000, 999999)
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
        console.log("Error Sending mail : ", err)
        res.redirect('/error')
    }
}


const home = async (req, res) => {
    try {
        const products = await productCollection.find({ isDeleted: false })
        const email = req.session.email
        if (req.session.user) {
            user = true;
            res.render('User/index', { email, products, user })
            console.log("home products :", products)

        } else {
            user = false;
            res.render('User/index', { email, products, user })
        }
    } catch (error) {
        console.log(error)
        res.redirect('/error')
    }

}
//SignUp 

const signup = (req, res) => {
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

            //todo:Compare OTP

            await collection.create(data);

            const check = await collection.findOne({ emailId: req.body.email });

            if (check.isBlocked) {
                res.render("User/signIn", { error: "You are blocked by admin!!!" });
            }

            req.session.email = req.body.email;
            req.session.user = req.body.email;
            req.session.otp = otp;
            req.session.otpExpiry = otpExpiry;
            req.session.requestedOTP = true;
            res.render("User/otp", {
                msg: "Please enter the OTP sent to your email",
            });
            await sendOTPByEmail(req.body.email, otp);

        } catch (error) {
            console.error(error);
            res.redirect('/error');
        }
    }
};


//SignIn

const signIn = (req, res) => {
    if (req.session.email) {
        res.redirect('/')
    } else {
        res.render('User/signIn', { oauthURL: getGoogleOAuthURL() })
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
                req.session.user = req.session.email
                req.session.isBlocked = false;
                //   console.log("The SID is: ", req.session.id);
                check.sessionId = req.session.id;
                await check.save();
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

const googleSignIn = async (req, res) => {
    const { code } = req.query;
    const query = new URLSearchParams();
    query.append('code', code);
    query.append('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID);
    query.append('client_secret', process.env.GOOGLE_OAUTH_CLIENT_SECRET);
    query.append('redirect_uri', 'http://localhost:7000/google-signin/callback')
    query.append('grant_type', 'authorization_code')

    let accessToken = null;
    let idToken = null;
    try {
        const res = await fetch(
            `https://oauth2.googleapis.com/token?${query.toString()}`,
            { method: "POST", headers: { "Accept": "application/json" } }
        );
        const data = await res.json();
        console.log(data);
        accessToken = data.access_token;
        idToken = data.id_token;
    } catch (err) {
        console.error(err);
    }
    // todo: take data.scope and validate if it has read:email
    if (!accessToken) return null;
    if (!idToken) return null;

    const googleUser = jwt.decode(idToken);
    console.log(googleUser);

    const existingUser = await collection.findOne({ emailId: googleUser.email });
    if (existingUser) {
        if (existingUser.isBlocked) {
            return res.render('User/signin', { error: "You are blocked by admin" });
        }

        req.session.email = existingUser.emailId;
        req.session.user = req.session.email
        req.session.isBlocked = false;
        existingUser.sessionId = req.session.id;

        await existingUser.save();

        return res.redirect("/");
    } else {
        // todo: handle the signup here!
        // googleUser.email -> string
        // googleUser.email_verified -> boolean
        // googleUser.name -> string
        // googleUser.picture -> string URL
        const dummyPassword = crypto.randomBytes(8).toString('hex');
        res.send("You do not have an account. First sign up using email and password.");
    }

}


//Signout

const signOut = (req, res) => {
    req.session.destroy((error) => {
        console.log("error in destroying session");
        if (error) {
            res.send("session destroyed!!")
        } else {
            res.redirect("/")
        }
    })
}



//function for verifying otp
const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    const storedOTP = parseInt(req.session.otp, 10);
    const otpExpiry = req.session.otpExpiry;

    if (new Date() > new Date(otpExpiry)) {
        return res.json({ isValid: false, msg: "OTP has expired. Please request a new one." });
    }

    try {
        const user = await collection.findOne({ emailId: req.session.user });

        if (!user) {
            return res.json({ isValid: false, msg: "User not found" });
        }

        // if (user.isBlocked) {
        //     return res.json({
        //         isValid: false,
        //         msg: "Your account has been blocked. Please contact support.",
        //     });
        // }

        if (otp === storedOTP) {
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
    const usermail = req.session.email;
    console.log("Resended OTP for " + usermail);
    
    if (req.session.requestedOTP) {
        const { otp, otpExpiry } = generateOTPWithExpiry()
        console.log("otp generated for resend is :", otp);
        req.session.otp = otp;
        req.session.otpExpiry = otpExpiry;
        await sendOTPByEmail(usermail, otp);
        console.log("[otp] was sent");
        res.json({ msg: "otp have been resented to your email " })
    } else {
        console.log("[otp] could not send");
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

const productDetails = (async (req, res) => {
    const productId = req.params.id
    try {
        const products = await productCollection.findById(productId)
        res.render('User/product_details', { products })
        console.log("this is the products:", products)
    } catch (error) {
        console.log(error)
        res.redirect("/error")
    }
})

//Forgot Password
const forgotPassword = async (req, res) => {

    res.render('User/forgotPassword')
}

const forgotPasswordPost = async (req, res) => {
    const email = req.body
    console.log("Email @ forgot password : ", email)
    res.render('user/signin')
    // try{
    //     const userData = await collection.find({emailId:email})
    //     console.log(("Data::",userData))
    // }catch(err){
    //     console.log(err)
    //     res.redirect('/error')
    // }

}



//About

const about = ((req, res) => {
    res.render('User/about')
})

//404_Error

const error = ((req, res) => {
    res.render('User/404')
})


const contact = ((req, res) => {
    res.render('User/contact')
})

module.exports = {
    home,
    signup,
    signupPost,
    signIn,
    signInPost,
    googleSignIn,
    signOut,
    about,
    error,
    verifyOTP,
    resendOTP,
    productDetails,
    generateOTPWithExpiry,
    contact,
    forgotPassword,
    forgotPasswordPost


}