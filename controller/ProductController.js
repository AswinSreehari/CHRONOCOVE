const productCollection  = require('../models/product')
const categoryCollection = require('../models/category')


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

    console.log('Its an Object ID')
   
    const additionalProductImage = req.files.additionalProductImage ? req.files.additionalProductImage.map(file => file.filename) : [];
  
    console.log(additionalProductImage);
  
    if (!mainProductImage || additionalProductImage.length === 0) {
      return res.status(400).json({ error: 'mainProductImage and additionalProductImages are required.' });
    }else{
  
    try {
  
      const newProduct = new productCollection({  productName, productDescription, productCategory, productQuantity , productPrice ,  mainProductImage,additionalProductImage });
      await newProduct.save();
  
      res.redirect('/admin/productmanagement');
    } catch (error) {
      console.error(error);
     res.redirect('/admin/error')
  }
}
  };

//Edit_Product

const editProduct = async (req, res) => {
    const productId = req.params.id;
    console.log("product id is:",productId);
    try {
        const product = await productCollection.findOne({_id: productId});
        const categories = await categoryCollection.find()

        const productWithImagePaths = {
            ...product.toJSON(), 
            mainProductImagePath: product.mainProductImage ? `/uploads/${product.mainProductImage}` : null,
            additionalProductImagePaths: product.additionalProductImage ? product.additionalProductImage.map(image => `/uploads/${image}`) : [],
        };
        console.log("the product is :", productWithImagePaths);
        res.render('admin/edit_product', { product: productWithImagePaths, categories });
   
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
            productQuantity: req.body.productQuantity,
            productPrice: req.body.productPrice
             
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
    try{
        console.log("hey");
        await productCollection.findByIdAndUpdate(productId,{ isDeleted:true})
        res.redirect('/admin/productmanagement')
    }catch(error){
        console.log(error)
        res.redirect('/admin/error')
    }
})

//Shop

const shop = (async(req,res)=>{
    try{
    const searchQuery = req.query.searchQuery || ''
    const products = await productCollection.find({productName:{$regex:searchQuery, $options: 'i'}},{isDeleted:false})
    console.log('Shop data recived!!')
    console.log("searchQUery :",searchQuery)
    res.render('User/shop',{products,searchQuery})
    }catch(error){
        console.log("Shop",error)
        res.redirect('/error')
    }
})


//Image_Delete

const deleteProductImage = async (req, res) => {
    var productId = req.params._id;
    var imageId = req.params.mainProductImagePath;
 
 }
 
 


module.exports={
    productmanagement,
    addProducts,
    addProductsPost,
    editProduct,
    editProductPost,
    deleteProduct,
    shop,
    deleteProductImage,
}