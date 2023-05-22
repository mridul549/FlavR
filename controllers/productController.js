const { default: mongoose } = require('mongoose');
const Product               = require('../models/product');
const Owner                 = require('../models/owner');
const Outlet                = require('../models/outlet');

module.exports.getAllProductsOfOutlet = (req,res) => {
    Product.find({ outlet: req.body.outletid })
    .select('_id category productName description price outlet productImage')
    .populate('outlet', '_id outletName address owner')
    .exec()
    .then(result => {
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
    .then(result => {
        return Owner.updateOne({_id: req.userData.ownerid}, {
            $push: {
                products: result._id
            }
        })
        .exec()
        .then(() => result)
    })
    .then(result => {
        return Outlet.updateOne({_id: req.body.outletid}, {
            $push: {
                menu: result._id
            }
        })
        .exec()
        .then(() => result)
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
