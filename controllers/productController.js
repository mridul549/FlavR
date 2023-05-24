const { default: mongoose, model } = require('mongoose');
const Product               = require('../models/product');
const Owner                 = require('../models/owner');
const Outlet                = require('../models/outlet');

module.exports.getProductsOfOutlet = (req,res) => {
    Product.find({ outlet: req.body.outletid })
    .select('_id category productName description price outlet productImage')
    .populate('outlet', '_id outletName address owner')
    .exec()
    .then(result => {
        if(result) {
            const response = {
                count: result.length,
                products: result.map(doc => {
                    return {
                        id: doc._id,
                        category: doc.category,
                        name: doc.productName,
                        description: doc.description,
                        price: doc.price,
                        outlet: doc.outlet
                    }
                })
            }
            res.status(201).json(response);
        } else {
            return res.status(404).json({
                error: "No products found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// we first check the DB for an existing produc if not found, 
// first we add it to the DB, then we add it to the outlet
// menu array and owner products array
module.exports.addProduct = (req,res) => {
    Product.find({
        $and: [
            { category: req.body.category },
            { productName: req.body.productName },
            { description: req.body.description },
            { price: req.body.price },
            { outlet: req.body.outletid },
            { owner: req.userData.ownerid }
        ]
    })
    .exec()
    .then(result => {
        if(result.length>0){
            return res.status(404).json({
                message: "Product already exists"
            })
        }
    
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            category: req.body.category,
            productName: req.body.productName,
            description: req.body.description,
            price: req.body.price,
            owner: req.userData.ownerid,
            outlet: req.body.outletid
        })

        return product.save();
    })
    .then(async result => {
        await Owner.updateOne({ _id: req.userData.ownerid }, {
            $push: {
                products: {
                    product: result._id,
                    outlet: req.body.outletid
                }
            }
        })
            .exec();
        return result;
    })
    .then(async result => {
        await Outlet.updateOne({ _id: req.body.outletid }, {
            $push: {
                menu: result._id
            }
        })
            .exec();
        return result;
    })
    .then(result => {
        return res.status(201).json({
            message: "Product added successfully",
            createdProduct: result
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// To avoid case sensitive search we use the $regex operator
module.exports.getProductsByCategory = (req,res) => {
    const category = req.body.categoryName
    const outletid = req.body.outletid

    Product.find({
        $and: [
            { 
                category: { 
                    $regex: new RegExp(category, 'i') 
                } 
            },
            { outlet: outletid }
        ]
    })
    .exec()
    .then(result => {
        if(result) {
            return res.status(201).json({
                products: result
            })
        } else {
            return res.status(404).json({
                error: "No categories found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.getSingleProduct = (req,res) => {
    const productID = req.body.productid

    Product.find({ _id: productID })
    .exec()
    .then(result => {
        if(result) {
            return res.status(201).json({
                product: result
            })
        } else {
            return res.status(201).json({
                error: "No product found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// Search all the products corresponding to an outlet
// keeping a count of a category in a map
// converting the map to an array of objects and returning it
module.exports.getAllCategories = (req,res) => {
    const outletid = req.body.outletid
    console.log(outletid);
    Product.find({ outlet: outletid })
    .select('category')
    .exec()
    .then(result => {
        if(result.length>0) {
            var categoryMap = new Map()
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                if(categoryMap.has(element.category)) {
                    categoryMap.set(element.category, categoryMap.get(element.category)+1);
                } else {
                    categoryMap.set(element.category, 1);
                }
            }
    
            var categoryArray = []
            categoryMap.forEach((value,key) => {
                categoryArray.push({
                    category: key,
                    count: value
                })
            })
    
            return res.status(201).json({
                categories: categoryArray
            })
        } else {
            return res.status(404).json({
                error: "No categories found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.updateProduct = (req,res) => {
    const productid = req.params.productid
    // not using the ownerid here, but accessing just to make sure
    // that only an owner can access this route and no regular user
    const ownerid = req.userData.ownerid

    const updateOps = {};
    for(const ops of req.body.updates) {
        updateOps[ops.propName] = ops.value
    }
    Product.updateOne({ _id: productid }, {
        $set: updateOps
    })
    .exec()
    .then(result => {
        return res.status(201).json({
            result
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// 1. delete product from DB
// 2. delete product from owner's product array
// 3. delete product from outlets menu
module.exports.deleteProduct = (req,res) => {
    const productid = req.body.productid
    const ownerid = req.userData.ownerid
    const outletid = req.body.outletid

    Product.deleteOne({ _id: productid })
    .exec()
    .then(async result => {
        try {
            await Owner.updateOne({ _id: ownerid }, {
                $pull: {
                    "products": {
                        "product": productid
                    }
                }
            })
            .exec();
            return result
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }
    })
    .then(async result => {
        try {
            await Outlet.updateOne({ _id: outletid, "menu": productid }, {
                $pull: {
                    "menu": productid
                }
            })
                .exec();
            return result;
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }
    })
    .then(result => {
        return res.status(201).json({
            message: "Product deleled successfully"
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}