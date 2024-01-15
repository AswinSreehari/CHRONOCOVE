const productCollection  = require('../models/product')
const categoryCollection = require('../models/category')
const ejs = require('ejs');


//Product_Management

const ITEMS_PER_PRODUCT_PAGE = 8;

const productmanagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PRODUCT_PAGE;

        const totalProducts = await productCollection.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PRODUCT_PAGE);

        const products = await productCollection.find().skip(skip).limit(ITEMS_PER_PRODUCT_PAGE);

        res.render('admin/productmanagement', { products, currentPage: page, totalPages });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/error');
    }
};



//Add_Products

const addProducts = (async(req,res)=>{
    const categories  = await categoryCollection.find({},'categoryName')
    res.render('admin/add_products',{categories})
})

const addProductsPost = async (req, res) => {
    const { productName, productDescription, productCategory, productQuantity , productPrice,offer} = req.body;
    const mainProductImage = req.files.mainProductImage[0] ? req.files.mainProductImage[0].filename : '';

    console.log('Its an Object ID')
   
    const additionalProductImage = req.files.additionalProductImage ? req.files.additionalProductImage.map(file => file.filename) : [];
  
    console.log(additionalProductImage);
  
    if (!mainProductImage || additionalProductImage.length === 0) {
      return res.status(400).json({ error: 'mainProductImage and additionalProductImages are required.' });
    }else{
  
    try {
        let updatedPrice;

        if (offer > 0) {
            const offerAmount = (offer / 100) * productPrice;  
            updatedPrice = Math.floor(productPrice - offerAmount);  
        }
        const offerPrice = updatedPrice
        console.log("offer price is :",offerPrice)
  
      const newProduct = new productCollection({  productName, productDescription, productCategory, productQuantity , productPrice ,  mainProductImage,additionalProductImage,offer,offerPrice });
      console.log("New Product:",newProduct)
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
    console.log("helloe i am inside the editpoduct post!!!!!!")
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
// adding the code for applying the product offer
let updatedPrice;

        if (req.body.offer > 0) {
            const offerAmount = (req.body.offer / 100) * req.body.productPrice;  
            updatedPrice = Math.floor(req.body.productPrice - offerAmount);  
        }
        const offerPrice = updatedPrice
        console.log("offer price is :",offerPrice)






        const productCat = categoryCollection.findOne({categoryName : req.body.productCategory})
        const updatedProduct = {
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            productCategory: productCat._id,
            productQuantity: Number(req.body.productQuantity),
            productPrice: Number(req.body.productPrice),
            offer:Number(req.body.offer),
            offerPrice:offerPrice
             
        };

        if(toDelArr){
            toDelArr = toDelArr.map(each => each.slice(9))
            const res =  product.additionalProductImage.filter(element => !toDelArr.includes(element));

            updatedProduct.additionalProductImage = res
        }

        console.log(updatedProduct)
        console.log('after updated')

         if (req.files && req.files['additionalProductImage']) {
            updatedProduct.additionalProductImage = [...req.files['additionalProductImage'].map(file => file.filename),... updatedProduct.additionalProductImage];
           
        }

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
const ITEMS_PER_PAGE = 6; 
const shop = async (req, res) => {
    try {
        const searchQuery = req.query.searchQuery || '';
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sort || 'latest';
        const skip = (page - 1) * ITEMS_PER_PAGE;

        let sortCriteria = {};
        if (sortBy === 'lowToHigh') {
            sortCriteria = { productPrice: 1 };
        } else if (sortBy === 'highToLow') {
            sortCriteria = { productPrice: -1 };
        } else {
            sortCriteria = { createdAt: -1 };
        }

        const products = await productCollection.aggregate([{ $match: { productName: { $regex: searchQuery, $options: 'i' }, isDeleted: false } }, { $lookup: { from: 'categorydatas', localField: 'productCategory', foreignField: '_id', as: 'category' } }, { $unwind: '$category' }, { $sort: sortCriteria }, { $skip: skip }, { $limit: ITEMS_PER_PAGE }]);
            
        const totalProducts = await productCollection.countDocuments({ productName: { $regex: searchQuery, $options: 'i' }, isDeleted: false });

        res.render('User/shop', { products, searchQuery, currentPage: page, totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE), currentSort: sortBy });
    } catch (error) {
        console.log('Shop', error);
        res.redirect('/error');
    }
};

  


const filter = async (req, res) => {    
    const minPrice = parseInt(req.query.minPrice ?? '10');
    const maxPrice = parseInt(req.query.maxPrice ?? '10000');
const query =  {$gt: minPrice, $lt: maxPrice};
    //  const products = await productCollection.find(query).populate('category')
     const products = await productCollection.aggregate([{ $match: { productPrice: query, isDeleted: false } }, { $lookup: { from: 'categorydatas', localField: 'productCategory', foreignField: '_id', as: 'category' } }, { $unwind: '$category' }]);
     const html = await ejs.renderFile('./views/User/_products-container.ejs', { products })
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