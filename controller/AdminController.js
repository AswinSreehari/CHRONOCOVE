const collection = require('../models/user')
const categoryCollection = require('../models/category')
const productCollection  = require('../models/product')
const multer = require('multer')

// Multer Configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public/uploads'); 
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname); 
//     },
//   });
  
 //const upload = multer({ storage: storage });
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

const productmanagement = (async(req,res)=>{
    try{
    const products = await productCollection.find()
    
    res.render('admin/productmanagement',{products})
    
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
})

//Add_Products

const addProducts = (async(req,res)=>{
    const categories  = await categoryCollection.find({},'categoryName')
    res.render('admin/add_products',{categories})
})

const addProductsPost = async (req, res) => {
    const { productName, productDescription, productCategory, productQuantity , productPrice} = req.body;
    const mainProductImage = req.files.mainProductImage[0] ? req.files.mainProductImage[0].filename : '';
   
    const additionalProductImage = req.files.additionalProductImage ? req.files.additionalProductImage.map(file => file.filename) : [];
  
    console.log(additionalProductImage);
  
    if (!mainProductImage || additionalProductImage.length === 0) {
      return res.status(400).json({ error: 'mainProductImage and additionalProductImages are required.' });
    }
  
    try {
  
      const newProduct = new productCollection({  productName, productDescription, productCategory, productQuantity , productPrice , mainProductImage,additionalProductImage });
      await newProduct.save();
  
      res.redirect('/admin/productmanagement');
    } catch (error) {
      console.error(error);
     res.redirect('/admin/error')
  }
  };





//Edit_Product

const editProduct = async (req, res) => {
    const productId = req.params.id;
    console.log("product id is:",productId);
    try {
        const product = await productCollection.findById(productId);
        console.log("the product is :",product);
        res.render('admin/edit_product', { product });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/error');
    }
};


const editProductPost = async (req, res) => {
    console.log("hai");
    const productId = req.params.id;
    console.log("products id is :", productId);
    console.log("hello:",req.body);
    const productName= req.body.productName
    console.log("product name is :",productName);
    try {
        
        const product = await productCollection.findById(productId);

        if (!product) {
            return res.redirect('/admin/error');
        }

        const updatedProduct = {
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            productCategory: req.body.productCategory,
            productQuantity: req.body.productQuantity
            // Add other properties you want to update
        };

        // Check if additionalProductImage exists in req.files
        if (req.files && req.files['additionalProductImage']) {
            updatedProduct.additionalProductImage = req.files['additionalProductImage'].map(file => file.filename);
        }

        // Check if mainProductImage exists in req.files
        if (req.files && req.files['mainProductImage']) {
            updatedProduct.mainProductImage = req.files['mainProductImage'][0].filename;
        }

        await productCollection.findByIdAndUpdate(productId, updatedProduct);
        res.redirect('/admin/productmanagement');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/error');
    }
};



// Delete_Product

const deleteProduct = (async(req,res)=>{
    const productId = req.params.id
    console.log("product id is :",productId);
    console.log("bye");
    try{
        console.log("hey");
        await productCollection.findByIdAndUpdate(productId,{ isDeleted:true})
        console.log("dey");
        res.redirect('/admin/productmanagement')
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
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
    categorymanagement,
    productmanagement,
    blank,
    error,
    addCategory,
    addCategoryPost,
    editCategory,
    editCategoryPost,
    deleteCategory,
    addProducts,
    addProductsPost,
    editProduct,
    editProductPost,
    deleteProduct,
    unblockUser,
    blockUser
    
}