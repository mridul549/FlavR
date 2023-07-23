const mongoose = require('mongoose')
const Category = require('../models/category')

module.exports.addCategory = async (req,res) => {
    let categoryName = req.body.categoryName 
    const outletid = req.body.outletid
    const categoryIconId = req.body.categoryIconId
    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)

    Category.find({
        $and: [
            { name: categoryName },
            { icon: categoryIconId },
            { outlet: outletid }
        ]
    })
    .exec()
    .then(async result => {
        if(result.length===0){
            const category = new Category({
                _id: new mongoose.Types.ObjectId(),
                name: categoryName,
                icon: categoryIconId,
                outlet: outletid
            })

            await category.save()
            return res.status(201).json({
                message: "Category created",
                categoryId: category._id
            })
        } else {
            return res.status(409).json({
                message: "Category already exists"
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

module.exports.updateCategory = (req,res) => {
    const categoryid = req.query.categoryid
    const outletid = req.query.outletid
    const categoryName = req.body.name
    const iconid = req.body.iconid

    Category.find({
        $and: [
            { _id: categoryid },
            { outlet: outletid }
        ]
    })
    .exec()
    .then(result => {
        if(result.length>0) {
            
            Category.updateOne({ _id: categoryid }, {
                $set: {
                    name: categoryName,
                    icon: iconid
                }
            })
            .exec()
            .then(result => {
                return res.status(200).json({
                    message: "Category updated successfully",
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
                message: "Category not found"
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

module.exports.getCategory = (req,res) => {
    const categoryid = req.query.categoryid

    Category.find({ _id: categoryid })
    .populate('icon')
    .populate('products')
    .exec()
    .then(result => {
        if(result.length>0){
            return res.status(200).json({
                category: result[0]
            })
        } else {
            return res.status(404).json({
                message: "category not found"
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