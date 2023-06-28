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
                message: "Category created"
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

