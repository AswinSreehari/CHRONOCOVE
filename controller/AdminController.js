const collection = require('../models/user')
const categoryCollection = require('../models/category')


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

//Category_Management

const categorymanagement = (async(req,res)=>{
    try{
    const data = await categoryCollection.find()
    res.render('admin/categorymanagement',{data})
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
})

//Add_Category

const addCategory = ((req,res)=>{
    res.render('admin/add_Category')
})

const addCategoryPost = async (req, res) => {
    try {
        const categoryName = req.body.categoryName;
        const existingCategory = await categoryCollection.findOne({ categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') }});

        if (existingCategory) {
            const error = "Category already exists!!";
            res.render('admin/add_Category', { error });
        } else {
            const data = {
                categoryName: req.body.categoryName,
                categoryDescription: req.body.categoryDescription
            };

            console.log(data);
            await categoryCollection.create(data);
            res.redirect('/admin/categorymanagement');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/admin/error');
    }
};

//Edit_Category

const editCategory = (async(req,res)=>{

    try{
    const id = req.params.id
    console.log("ID:",id);
    const data = await categoryCollection.findOne({_id:id})
    console.log(data)
    res.render('admin/edit_category',{data})
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
})

const editCategoryPost = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const categoryData = {
            Name: data.categoryName,
            Description: data.categoryDescription
        };

        const existingCategory = await categoryCollection.findOne({
            categoryName: { $regex: new RegExp('^' + categoryData.Name + '$', 'i') },
            _id: { $ne: id }
        });

        if (existingCategory) {
            const error = "Category already exists!!";
            return res.render('admin/edit_category', { data, error });
        }

        await categoryCollection.findOneAndUpdate(
            { _id: id },
            { $set: { categoryName: categoryData.Name, categoryDescription: categoryData.Description } }
        );

        res.redirect('/admin/categorymanagement');
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/error');
    }
};


//Delete_Category

const deleteCategory = (async(req,res)=>{
    const data = req.params.id
    console.log('Data is :',data)
    await categoryCollection.findOneAndDelete({_id:data})
    res.redirect('/admin/categorymanagement')
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
    addCategory,
    addCategoryPost,
    editCategory,
    editCategoryPost,
    deleteCategory
}