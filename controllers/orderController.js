const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const axios      = require('axios');

/* 
    1. get all items in cart
    2. calculate total price
    3. update the order schema accordingly without order number
    4. take payment
    5. after payment assign order number
    6. add the order to the respective outlet

    Things to work on:
    1. Payment
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
                const variant = element.variant
                let price=0

                if(variant==="default"){
                    // if no variant exists of a product
                    const product = await Product.find({ _id: element.product });
                    price=product[0].price
                } else {
                    // only returns 1 element in the variants array matching the variantName
                    const product = await Product.find({ 
                        _id: element.product, 
                        'variants.variantName': variant
                    }, { 'variants.$': 1 })
                    price = product[0].variants[0].price
                }
                totalAmount += (price*element.quantity)
                totalQuantity += element.quantity
    
                productArr.push({
                    item: element.product,
                    variant: variant,
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

            // Generate cashfree token and send to the frontend SDK
            .then(async newOrder => {
                const payment = await getPaymentToken(newOrder, outletid, result, req, res)
                return res.status(201).json({
                    message: "Order added to the database and cashfree token successfully generated",
                    cf_order_id: payment.data.cf_order_id,
                    order_id: newOrder._id,
                    payment_session_id: payment.data.payment_session_id,
                    order_status: payment.data.order_status
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

module.exports.deleteAll = (req,res) => {
    const userid = req.userData.userid
    Order.deleteMany({ user: userid })
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "Deleted all"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

/**
 *** All payment methods go here ***

 ** Get payment token- 
 * called on creation of a new order and generates a cashfree token for the frontend to handle.
 * 
 * TODO-
 * Add easy split
 * Add notifyUrl for webhooks
*/ 
getPaymentToken = async (neworder, outletid, user, req, res) => {
    const headers = {
        'x-client-id': process.env.CF_APP_ID,
        'x-client-secret': process.env.CF_API_KEY,
        'x-api-version': '2022-09-01',
    };
    
    const data = {
        order_amount: neworder.totalPrice,
        order_id: neworder._id,
        order_currency: 'INR',
        customer_details: {
            customer_id: user[0]._id,
            customer_name: user[0].userName,
            customer_email: user[0].email,
            customer_phone: "7009100026"
        },
        order_tags: {
            outlet_id: outletid
        },
    };

    try {
        const response = await axios.post('https://sandbox.cashfree.com/pg/orders', data, { headers });
        return response
    } catch (error) {
        console.error(error);
    }
}
