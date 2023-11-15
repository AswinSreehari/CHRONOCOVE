const collection = require('../models/user')
const bcrypt = require('bcrypt')


const home = (req,res)=>{
    console.log("inside the index");
    res.render('User/index')
}
//SignUp 

const signup = (req,res)=>{
    res.render('User/signup')
} 
const signupPost = (async(req,res)=>{
    const {name,email,password} = req.body
    try{

        const existingMail = await collection.findOne({emailId:email})
        console.log("existing mail:",existingMail);
        const hashedPassword = await bcrypt.hash(password,10)
        if(existingMail){
            console.log("hai");
            return res.status(400).send("Email already existing.Please choose another Email")
        }else{
        const Data={
            username:name,
            emailId:email,
            password:hashedPassword,
        }
        await collection.create(Data)
        console.log(Data)
        req.session.user = req.body.name
        res.render('User/index')
    }
    }catch(error){
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

//SignIn

const signIn = (req,res)=>{
    res.render('User/signin')
}
const signInPost = async(req,res)=>{
     const email = req.body.mail;
     console.log("email is :",email);
    try{
        console.log("inside try")
        const check = await collection.findOne({ emailId:email})
        console.log(check)
        if(!check){
            console.log("User name cannot found")
        } else{
        const isPasswordmatch = await bcrypt.compare(req.body.password,check.password)
        if(isPasswordmatch){
            req.session.email = check.email;
            res.render('User/index')
        }else{
            res.send('Invalid password')
        }
        }
       
    }catch{
        res.send("Wrong Details")
    }
}

//Signout

const signOut = (req,res)=>{
    req.session.user = null
    res.redirect('/signin')
}

//About

const about = ((req,res)=>{
    res.render('User/about')
})





module.exports={
    home,
    signup,
    signupPost,
    signIn,
    signInPost,
    signOut,
    about
}