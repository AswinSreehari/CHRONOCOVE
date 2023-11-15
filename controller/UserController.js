const collection = require('../models/user')
const bcrypt = require('bcrypt')


const home = (req,res)=>{
    const email = req.session.email
    res.render('User/index',{email})
     
}
//SignUp 

const signup = (req,res)=>{
    res.render('User/signup')
} 
const signupPost = (async(req,res)=>{
    const {name,email,password} = req.body
    try{

        const existingEmail = await collection.findOne({emailId:email})
        console.log("existing email:",existingEmail);
        const hashedPassword = await bcrypt.hash(password,10)
        if(existingEmail){
            return res.status(400).send("Email already existing.Please choose another Email")
        }else{
        const Data={
            username:name,
            emailId:email,
            password:hashedPassword,
        }
        await collection.create(Data)
        console.log(Data)
        req.session.email = req.body.email
        res.render('User/index')
    }
    }catch(error){
        console.log(error)
        // res.status(500).send('Internal Server Error')
        res.redirect('/error')
    }
})

//SignIn

const signIn = (req,res)=>{
    if(req.session.email){
        res.redirect('/home')
    }else{
         res.render('User/signIn')
    } 
}

const signInPost = async(req,res)=>{
    console.log("inside signinPost  ")
     const email = req.body.email;
     console.log("email is :",email);
    try{
        console.log("inside try")
        const check = await collection.findOne({ emailId:email})
        console.log("checked user",check)
        if(!check){
            console.log("User name cannot found")
        } else{
        const isPasswordmatch = await bcrypt.compare(req.body.password,check.password)
        if(isPasswordmatch){
            req.session.email = check.emailId;
            console.log(req.session.email);
            res.redirect("/")
        }else{
            res.send('Invalid password')
        }
        }
       
    }catch(error){
         console.error("Error during SignIn:",error)
        //  res.status(500).send("Internal Status Error")
        res.redirect('/error')

    }
}

//Signout

const signOut = (req,res)=>{
    console.log("inside signout");
    req.session.destroy((err)=>{
        if(err){
            console.log("got an error");
            console.error("Error destroying Session :",err)
        }
        console.log("gonna redirect to home");
        res.redirect("/")
    })
}

//About

const about = ((req,res)=>{
    res.render('User/about')
})

//404_Error

const error = ((req,res)=>{
    res.render('User/404')
})





module.exports={
    home,
    signup,
    signupPost,
    signIn,
    signInPost,
    signOut,
    about,
    error
}