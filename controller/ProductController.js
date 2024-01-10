const productCollection  = require('../models/product')
const categoryCollection = require('../models/category')
const ejs = require('ejs');


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
    let toDelArr = []
    if(req.body.deleteImage){
        toDelArr.push(...JSON.parse(req.body.deleteImage))
    }
    const productId = req.params.id;
    const productName= req.body.productName

    try {
        
        const product = await productCollection.findById(productId);
        if (!product) {
            return res.redirect('/admin/error');
        }
        const productCat = categoryCollection.findOne({categoryName : req.body.productCategory})
        const updatedProduct = {
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            productCategory: productCat._id,
            productQuantity: Number(req.body.productQuantity),
            productPrice: Number(req.body.productPrice)
             
        };

        if(toDelArr){
            toDelArr = toDelArr.map(each => each.slice(9))
            const res =  product.additionalProductImage.filter(element => !toDelArr.includes(element));

            updatedProduct.additionalProductImage = res
        }

        console.log(updatedProduct)
        console.log('after updated')

        // Check if additionalProductImage exists in req.files
        if (req.files && req.files['additionalProductImage']) {
            updatedProduct.additionalProductImage = [...req.files['additionalProductImage'].map(file => file.filename),... updatedProduct.additionalProductImage];
           
        }

        // Check if mainProductImage exists in req.files
        if (req.files && req.files['mainProductImage']) {
            updatedProduct.mainProductImage = req.files['mainProductImage'][0].filename;
        }

        await productCollection.findByIdAndUpdate(productId,updatedProduct,{new : true});
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

// const shop = (async(req,res)=>{
//     try{
//     const searchQuery = req.query.searchQuery || ''
//     const products = await productCollection.find({productName:{$regex:searchQuery, $options: 'i'}},{isDeleted:false})
//     console.log('Shop data recived!!')
//     console.log("searchQUery :",searchQuery)
//     res.render('User/shop',{products,searchQuery})
//     }catch(error){
//         console.log("Shop",error)
//         res.redirect('/error')
//     }
// })

const ITEMS_PER_PAGE = 6; 

const shop = async (req, res) => {
    try {
        const searchQuery = req.query.searchQuery || '';
        const page = parseInt(req.query.page) || 1;

        // Calculate the skip value based on the page number
        const skip = (page - 1) * ITEMS_PER_PAGE;

        // Query the products with pagination and search
        const products = await productCollection
            .find({ productName: { $regex: searchQuery, $options: 'i' }, isDeleted: false })
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

        // Count total number of products for pagination
        const totalProducts = await productCollection.countDocuments({ productName: { $regex: searchQuery, $options: 'i' }, isDeleted: false });

        // res.render('User/shop', { products, searchQuery, currentPage: page, totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE) });
        res.render('User/shop', { products, searchQuery, currentPage: page, totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE) });

    } catch (error) {
        console.log('Shop', error);
        res.redirect('/error');
    }
};


const filter = async (req, res) => {
    const minPrice = parseInt(req.query.minPrice ?? '10');
    const maxPrice = parseInt(req.query.maxPrice ?? '10000');
const query = { productPrice: {$gt: minPrice, $lt: maxPrice} };
// console.log(query);
    const products = await productCollection.find(query)
    // console.log(products);
    const html = await ejs.renderFile('./views/User/_products-container.ejs', { products })
    // console.log(html);
    res.send(html);
}

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
    filter,
    deleteProductImage,
}