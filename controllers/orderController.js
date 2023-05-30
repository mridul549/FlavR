const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');

/* 
    1. get all items in cart
    2. calculate total price
    3. update the order schema accordingly without order number
    4. take payment
    5. after payment assign order number

    Things to work on:
    1. Order number generation
    2. Payment
*/
module.exports.placeOrder = async (req, res) => {
    const userid   = req.userData.userid
    const outletid = req.body.outletid

    User.find({ _id: userid })
    .exec()
    .then(result => {
        if(result.length>0) {
            let totalAmount, totalQuantity;
            const cart = result[0].cart
            const productArr = []
            
            for (let i = 0; i < cart.length; i++) {
                const element = cart[i];
                totalAmount += (element.product.price*element.quantity)
                totalQuantity += element.quantity
    
                productArr.push({
                    item: element.product,
                    quantity: element.quantity
                })
            }
    
            const order = new Order({
                user: userid,
                outlet: outletid,
                products: productArr,
                totalPrice: totalAmount,
                totalQuantity: totalQuantity
            })
    
            order.save()
            .then(result => {
                const orderid = result._id
    
                // TODO- COLLECT PAYMENT

                // TODO- UPDATE PAYMENT STATUS
    
                // TODO- ASSIGN ORDER NUMBER
    
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({
                    error: err
                })
            })
        } else {
            return res.status(400).json({
                error: "User not found"
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
