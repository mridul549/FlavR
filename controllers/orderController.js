const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const Queue      = require('bull');
const { REDIS_PORT, REDIS_URI } = require('../config/redis')

const orderQueue = new Queue('orderQueue', {
    redis: {
        port: REDIS_PORT,
        host: REDIS_URI
    }
})

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
    .then(async result => {
        if(result.length>0) {
            let totalAmount=0, totalQuantity=0;
            const cart = result[0].cart
            const productArr = []

            for (let i = 0; i < cart.length; i++) {
                const element = cart[i];
                const product = await Product.find({ _id: element.product });

                totalAmount += (product[0].price*element.quantity)
                totalQuantity += element.quantity
    
                productArr.push({
                    item: element.product,
                    quantity: element.quantity
                })
            }

            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                user: userid,
                outlet: outletid,
                products: productArr,
                totalPrice: totalAmount,
                totalQuantity: totalQuantity
            })
    
            order.save()

            // TODO- ASSIGN ORDER NUMBER by adding to queue
            .then(async result => {
                const orderid = result._id
                await orderQueue.add({ orderid })
                return result
            })


            // TODO- ADD THE ORDER TO THE OUTLET
            // .then(async result => {

            // })


            .then(result => {
                return res.status(200).json({
                    message: "Order successfully placed"
                })
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

/* 
    1. after updating the order with all the deets and collecting payment
    2. add this order to the queue for order number assignment
    3. after order number assignment, add this order to the respective outlet
*/

// TODO- COLLECT PAYMENT

// TODO- UPDATE PAYMENT STATUS
// 1. send a res to client here and let the rest of the functioning work

