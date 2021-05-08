const mongoose = require("mongoose");
const validationUtils = require('../utils/validation_utils');

const Product = require('../models/product_model');
const ProductCategory = require('../models/product_category_model');
const formatUtils = require('../utils/format_utils');

async function isCategoryIDExists(categoryID) {
    const storedCategory = await ProductCategory.findById(categoryID).exec();
    return storedCategory != null;
}

exports.addCategory = async (req, res) => {
    try {
        const categoryName = req.body.categoryName;
        // validation
        if (validationUtils.validateString(categoryName, 'categoryName', undefined, 6))
            return res.status(400).json({message: validationUtils.validateString(categoryName, 'categoryName', undefined, 6)});
        // check if category already stored to avoid duplicates
        const storedCategory = await ProductCategory.findOne({name: categoryName}).exec();
        if (storedCategory != null) 
            return res.status(409).json({message: "category already available"});
        // save category
        const category = new ProductCategory({
            _id: new mongoose.Types.ObjectId(),
            name: categoryName,
        });
        await category.save();
        res.status(201).json({message: "category created successfully"});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getAllCategories = async (req, res) => {
    try {
        let categories = await ProductCategory.find().exec();
        categories = categories.map((category) => {
            return {
                id: category._id,
                name: category.name,
                imageURL: `images/products/categories/${category._id}.png`
            };
        });
        res.status(200).json({data: categories});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.addProduct = async (req, res) => {
    try {
        const { categoryID, isFeatured, name, price, imageURL, description, specs } = req.body;
        // validation
        // categoryID
        if (validationUtils.validateString(categoryID, 'categoryID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(categoryID, 'categoryID', /^[0-9a-fA-F]{24}$/)});
        // isFeatured
        if (validationUtils.validateBoolean(isFeatured, 'isFeatured'))
            return res.status(400).json({message: validationUtils.validateBoolean(isFeatured, 'isFeatured')});
        // Name
        if (validationUtils.validateString(name, 'name', undefined, 6))
            return res.status(400).json({message: validationUtils.validateString(name, 'name', undefined, 6)});
        // Price
        if (validationUtils.validateNum(price, 'price', undefined, 1))
            return res.status(400).json({message: validationUtils.validateNum(price, 'price', undefined, 1)});
        // imageURL
        if (validationUtils.validateString(imageURL, 'imageURL', /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
            return res.status(400).json({message: validationUtils.validateString(imageURL, 'imageURL', /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)});
        // description
        if (validationUtils.validateString(description, 'description', undefined, 10))
            return res.status(400).json({message: validationUtils.validateString(description, 'description', undefined, 10)});
        // specs
        if (specs == undefined || specs.length <= 0)
            return res.status(400).json({message: "the field specs is required"});
        else if (!(specs instanceof Array))
            return res.status(400).json({message: "specs must be a List of objects with this keys: name: String, value: String"});
        for (let i = 0; i < specs.length; i ++) {
            let spec = specs[i];
            if (validationUtils.validateString(spec.name, `specs[${i}] spec.name`, undefined, 2)) 
                return res.status(400).json({message: validationUtils.validateString(spec.name, `specs[${i}] spec.name`, undefined, 2)});                
            if (validationUtils.validateString(spec.value, `specs[${i}] spec.value`))
                return res.status(400).json({message: validationUtils.validateString(spec.value, `specs[${i}] spec.value`)});
        }
        // check if categoryID refer to actual category
        if (!(await isCategoryIDExists(categoryID)))
            return res.status(404).json({message: "no category with this ID could be found"});
        const product = new Product({
            _id: new mongoose.Types.ObjectId.ObjectId(),
            categoryID: categoryID,
            isFeatured: isFeatured,
            name: name,
            price: price,
            imageURL: imageURL,
            description: description,
            specs: specs,
        });
        await product.save();
        res.status(201).json({message: "product created successfully"});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }

}

exports.getCategoryProducts = async (req, res) => {
    try {
        const categoryID = req.params.categoryID;
        // validation
        if (validationUtils.validateString(categoryID, 'categoryID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(categoryID, 'categoryID', /^[0-9a-fA-F]{24}$/)});
        // check if categoryID refer to actual category
        if (!(await isCategoryIDExists(categoryID)))
            return res.status(400).json({message: "invalid categoryID"});
        // get category products
        let categoryProducts = await Product.find({categoryID: categoryID}).populate('categoryID').exec();
        // get category name
        const category = await ProductCategory.findOne({_id: categoryID});
        // check if category available
        if (!category)
            return res.status(404).json({message: 'no category with this ID could be found'});
        const categoryName = category.name;
        // format products
        categoryProducts = categoryProducts.map((product) => formatUtils.formatProduct(product));
        res.status(200).json({
            data: {
                categoryName: categoryName,
                categoryProducts: categoryProducts
            }
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getProductDetails = async (req, res) => {
    try {
        const productID = req.params.productID;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        const product = await Product.findById(productID).populate('categoryID').exec();
        if (!product)
            return res.status(404).json({message: "No Product with the given ID could be found"});
        // increment the clicks property
        await product.updateOne({$inc: {clicks: 1}});
        res.status(200).json({data: formatUtils.formatProduct(product, true)});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getMostPopularProducts = async (req, res) => {
    try {
        let popularProducts = await Product.find().populate('categoryID').sort({clicks: -1}).limit(10).exec();
        popularProducts = popularProducts.map((product) => formatUtils.formatProduct(product));
        res.status(200).json({data: popularProducts});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await Product.find({isFeatured: true}).populate('categoryID').sort({clicks: -1}).limit(10).exec();
        // if there is no featuredProducts return newest 10 products
        if (featuredProducts.length <= 0) {
            featuredProducts = await Product.find().populate('categoryID')
                .sort([['createdAt', -1], ['clicks', -1]]).limit(10).exec();
        }
        featuredProducts = featuredProducts.map((product) => formatUtils.formatProduct(product));
        res.status(200).json({data: featuredProducts});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}