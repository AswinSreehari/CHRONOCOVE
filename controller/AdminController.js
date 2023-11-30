const collection = require('../models/user')

const multer = require('multer')

 
const upload = multer({dest:"public/uploads"})
    


//Admin_SignIn

const signin = ((req,res)=>{
    try{
        if(req.session.admin){
        res.redirect('/admin/dashboard')
        }else{
            res.render('admin/admin_signin')

        }
    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
})

const signinPost = ((req,res)=>{
    try{
    const {username , password} = req.body
    console.log("username: ",username)
    console.log("password: ",password)
    if(username == process.env.ADMIN_USERNAME && password == process.env.ADMIN_PASSWORD){
        req.session.admin = username
        res.redirect('/admin/dashboard')
    }else{
        const msg = 'Wrong Input!!'
        console.log("Error is :",msg)
        res.render('admin/admin_signin',{msg})
    }
    }catch(error){
        console.log("error",error)
    res.redirect('/admin/error')
    }
})

//Sign Out

const signout = ((req,res)=>{
     req.session.admin = null
     res.render('admin/admin_signin')
})

//Admin_Dashboard
const Dashboard =((req,res)=>{
    if(req.session.admin){
    res.render('admin/admin_index')
    }else{
        res.redirect('/admin/error')
    }
})

//User_Management

const usermanagement = async(req,res)=>{
    try{
    const data = await collection.find()
    console.log("data:",data)
    res.render('admin/usermanagement',{data})
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
} 


//Blank_Page

const blank = ((req,res)=>{
    res.render('admin/admin_blank')
})

//404_Error

const error = ((req,res)=>{
    res.render('admin/admin_404')
})


// function to block the user
const blockUser = async (req, res) => {

    const userId = req.params.id;
  
    try {
      console.log("inside the try hai")
      const userData = await collection.findById(userId)
      if (!userData) {
        res.status(404).json({ error: 'User not found' });
  
      } else {
        userData.isBlocked = true
        await userData.save()
        //res.status(500).json({ error: 'cannot login in' });
        res.redirect('/admin/usermanagement')
      }
    }
    catch (err) {
      console.error(err);
      res.redirect("/admin/error")
    }
  }
  
  // function for unblocking the user
  
  const unblockUser = async (req, res) => {
    const userid = req.params.id
    try {
      const userData = await  collection.findById(userid)
      if (!userData) {
        res.redirect("/admin/error")
  
      } else {
        userData.isBlocked = false
        await userData.save()
        console.log("user can now login");
        const msg = "unblocked  the specified user"
        //res.send("user can now login")
        console.log(msg);
        res.redirect('/admin/usermanagement')
      }
    }
    catch (err) {
      res.redirect("/admin/error")
    }
  }





module.exports={
    signin,
    signinPost,
    Dashboard,
    signout,
    usermanagement,
    blank,
    error,
    unblockUser,
    blockUser
    
}