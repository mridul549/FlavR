const { default: mongoose } = require('mongoose');
const Product = require('../models/product');

module.exports.getAllProducts = (req,res) => {
    Product.find()
    .select('_id productName description price outlet productImage')
    .exec()
    .then(result => {
        const response = {
            count: result.length,
            products: result.map(doc => {
                return {
                    id: doc._id,
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

module.exports.addProduct = (req,res) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        
    })
}