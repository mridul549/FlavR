const { default: mongoose, model } = require('mongoose');
const Product               = require('../models/product');
const Owner                 = require('../models/owner');
const Outlet                = require('../models/outlet');
const cloudinary            = require('cloudinary').v2;
const redis                 = require('redis');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

module.exports.getProductsOfOutlet = (req,res) => {
    Product.find({ outlet: req.query.outletid })
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
                        veg: doc.veg,
                        productImage: doc.productImage,
                        variants: doc.variants,
                        inStock: doc.inStock
                    }
                })
            }

            res.status(200).json(response);
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

function saveProduct (product, req, res) {
    product.save()
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
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            error: "Failed to save product"
        });
    });
}

// we first check the DB for an existing product if not found, 
// first we add it to the DB, then we add it to the outlet
// menu array and owner products array
// image handling is done the following way:
// if a file is passed in the form, it is accepted and uploaded
// else image id and url is passed as null

/**
 * 1. A single product ID can contain multiple variants of a product.
 * 2. If no variant of a product is passed in request, give the price of the product simply
 * 3. If variants exist, owner will be asked to give the price of (main) product as the lowest price from the variants.
 *      E.g. -> If half price is 40, and full is 80 then the price of the product will be 40.
 * 4. An owner will get an option to update the variants of a product through a seperate route if he doesn't do so on the creation.
 * 
 */
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
        
        let variants = req.body.variants
        // if variants array is not recieved, intialise it to empty array
        if(variants===undefined) {
            variants=[]
        } else {
            variants = JSON.parse(variants)
        }
        
        var imageProp = {
            url: "null",
            imageid: "null"
        }

        const productwofile = new Product({
            _id: new mongoose.Types.ObjectId(),
            category: req.body.category,
            productName: req.body.productName,
            description: req.body.description,
            price: req.body.price,
            veg: req.body.veg,
            owner: req.userData.ownerid,
            outlet: req.body.outletid,
            variants: variants,
            productImage: imageProp
        })

        if(req.files && req.files.productImage) {
            const file = req.files.productImage
            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(201).json({
                        error: "image upload failed"
                    })
                }
    
                imageProp = {
                    url: image.url,
                    imageid: image.public_id
                }

                const productwfile = new Product({
                    _id: new mongoose.Types.ObjectId(),
                    category: req.body.category,
                    productName: req.body.productName,
                    description: req.body.description,
                    price: req.body.price,
                    veg: req.body.veg,
                    owner: req.userData.ownerid,
                    outlet: req.body.outletid,
                    variants: variants,
                    productImage: imageProp
                })
                saveProduct(productwfile, req, res)
            })
        } else {
            saveProduct(productwofile, req, res)
        }
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
    const category = req.query.categoryName
    const outletid = req.query.outletid

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
            return res.status(200).json({
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
    const productID = req.query.productid

    Product.find({ _id: productID })
    .exec()
    .then(result => {
        if(result) {
            return res.status(200).json({
                product: result
            })
        } else {
            return res.status(404).json({
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
    const outletid = req.query.outletid

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
    
            return res.status(200).json({
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
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const updateOps = {};
            for(const ops of req.body.updates) {
                updateOps[ops.propName] = ops.value
            }
            Product.updateOne({ _id: productid }, {
                $set: updateOps
            })
            .exec()
            .then(result => {
                return res.status(200).json({
                    message: "Product updated successfully",
                    ACK: result
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
        } else {
            return res.status(404).json({
                error: "Owner not found"
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

// 1. delete product image if exits
// 2. delete product from DB
// 3. delete product from owner's product array
// 4. delete product from outlets menu
module.exports.deleteProduct = (req,res) => {
    const productid = req.body.productid
    const ownerid = req.userData.ownerid
    const outletid = req.body.outletid

    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result[0].owner == ownerid) {
            Product.find({ _id: productid })
            .exec()
            .then(result => {
                if(result.length>0) {
                    const imageidOld = result[0].productImage.imageid

                    if(imageidOld!=="null" || imageidOld===undefined) {
                        cloudinary.uploader.destroy(imageidOld, (err,result) => {
                            if(err) {
                                return res.status(500).json({
                                    error: "error in deleting the old image"
                                })
                            }
                        })
                    }

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
                        return res.status(200).json({
                            message: "Product deleled successfully"
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
                } else {
                    return res.status(404).json({
                        error: "Product not found"
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
        } else {
            return res.status(401).json({
                error: "Bad request",
                message: "Owner does not have auth to delete this product"
            })
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

// 1. Delete old image if exits
// 2. Upload new image
// 3. Update the product
module.exports.updateProductImage = (req,res) => {
    const productid = req.body.productid

    Product.find({ _id: productid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].productImage.imageid

            if(imageidOld !== "null") {
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            const file = req.files.newProductImage
            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(500).json({
                        error: "image upload failed"
                    })
                }
                Product.updateOne({ _id: productid }, {
                    $set: { productImage: {
                        url: image.url,
                        imageid: image.public_id
                    }}
                })
                .exec()
                .then(docs => {
                    return res.status(200).json({
                        message: "Image updated successfully"
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    })
                })
            })
        } else {
            return res.status(404).json({
                error: "Product not found"
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

module.exports.updateVariants = (req,res) => {
    const productid = req.body.productid
    const variants  = req.body.variants

    Product.updateOne({ _id: productid }, {
        $set: { variants: variants }
    })
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "Variants updated successfully!"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.getAllVariants = (req,res) => {
    const productid = req.query.productid

    Product.find({ _id: productid })
    .exec()
    .then(result => {
        if(result.length>0){
            const variants = result[0].variants
            return res.status(200).json({
                variants: variants
            })
        } else {
            return res.status(404).json({
                error: "Product not found!"
            })
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.inStock = (req,res) => {
    const instock   = req.body.instock
    const productid = req.body.productid
    
    Product.updateOne({ _id: productid }, {
        $set: { inStock: instock }
    })
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "In Stock value updated successfully"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}