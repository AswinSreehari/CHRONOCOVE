const categoryCollection = require('../models/category')
const productCollection  = require('../models/product')
//Category_Management

const ITEMS_PER_PAGE = 8;  

const categorymanagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const totalCategories = await categoryCollection.countDocuments();
        const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

        const data = await categoryCollection.find().skip(skip).limit(ITEMS_PER_PAGE);

        res.render('admin/categorymanagement', { data, currentPage: page, totalPages });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/error');
    }
};


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
        }else{

        await categoryCollection.findOneAndUpdate(
            { _id: id },
            { $set: { categoryName: categoryData.Name, categoryDescription: categoryData.Description } }
        );
        }

        res.redirect('/admin/categorymanagement');
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/error');
    }
};


//Delete_Category

const deleteCategory = (async(req,res)=>{
    const data = req.params.id
     await categoryCollection.findOneAndDelete({_id:data})
    res.redirect('/admin/categorymanagement')
})



const sendCategoryOffer = async (req, res) => {
     try {
        const activeCategories = await categoryCollection.find({ isDeleted: false });
        console.log("active categories are:",activeCategories)
        const categories = await categoryCollection.find();
        res.render('admin/categoryoffer', { activeCategories, categories });
    } catch (error) {
        console.error(error);
        res.render('admin/error')
    }
};  



const applyOffer = async (req, res) => {
    const { categoryId, percentage } = req.body;

    try {
        // Find the category by its ID
        const category = await categoryCollection.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Find all products belonging to the category
        const products = await productCollection.find({ productCategory: categoryId });
          for (const product of products) {
            const updatedPrice = Math.floor(product.productPrice - (product.productPrice * (percentage / 100)));
            // const realPrice=product.price;
            // product.price = updatedPrice;
            product.offPrice=updatedPrice;
            await product.save();
        }

        console.log("product after applying category offer is :",products)
        return res.json({ success: true, message: 'Offer applied successfully!' });
    } catch (error) {
        console.error(error);
        res.render('admin/error')
    }
};


module.exports={
    categorymanagement,
    addCategory,
    addCategoryPost,
    editCategory,
    editCategoryPost,
    deleteCategory,
    sendCategoryOffer,
    applyOffer
}