const collection = require('../models/user')


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
    req.session.destroy((err)=>{
        if(err){
            console.log('Error destroying session :',err)
        }else{
            res.redirect('/admin/signin')
        }
    })
})

//Admin_Dashboard
const Dashboard =((req,res)=>{
    if(req.session.admin){
    console.log('Dashboard')
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


//Category_Management

const categorymanagement = ((req,res)=>{
    res.render('admin/categorymanagement')
})

//Product_Management

const productmanagement = ((req,res)=>{
    res.render('admin/productmanagement')
})

//Blank_Page

const blank = ((req,res)=>{
    res.render('admin/admin_blank')
})

//404_Error

const error = ((req,res)=>{
    res.render('admin/admin_404')
})


module.exports={
    signin,
    signinPost,
    Dashboard,
    signout,
    usermanagement,
    categorymanagement,
    productmanagement,
    blank,
    error,
}