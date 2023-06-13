const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const Coupon     = require('../models/coupon');
const axios      = require('axios');

/* 
    1. get all items in cart
    2. calculate total price
    3. check for a coupon code and deduct the price accordingly 
    4. update the order schema accordingly without order number
    5. generate the payment token using cashfree API
*/

async function addcoupon (req,res,userid,outletid,couponcode,totalAmount) {
    return new Promise((resolve, reject) => {
        Coupon.find({ code: couponcode })
        .exec()
        .then(coupon => {
            if(coupon.length>0){
                // coupon already used
                if(coupon[0].used){
                    return res.status(400).json({
                        error: "BAD REQUEST",
                        message: "Coupon already used once."
                    })
                } else {
                    if(coupon[0].outlet!=outletid){
                        return res.status(403).json({
                            error: "FORBIDDEN",
                            message: "Coupon doesn't belong to this outlet."
                        })
                    }

                    if(coupon[0].discount>totalAmount){
                        return res.status(422).json({
                            error: "Unprocessable Entity",
                            message: "Coupon amount is greater than total price of items to be ordered."
                        })
                    }

                    if(coupon[0].createdBy!==userid){
                        return res.status(400).json({
                            error: "BAD REQUEST",
                            message: "Coupon does not belong to you."
                        })
                    }

                    // coupon not used before, set its used field to true
                    Coupon.findOneAndUpdate({ code: couponcode }, {
                        $set: { used: true }
                    })
                    .exec()
                    .then(coupon => {
                        totalAmount-=coupon.discount
                        resolve(totalAmount);
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err)
                    })
                }
            } else {
                return res.status(404).json({
                    error: "Coupon not found"
                })
            }
        })
        .catch(err => {
            console.log(err);
            reject(err)
        })
    })
}

module.exports.placeOrder = async (req, res) => {
    const userid     = req.userData.userid
    const outletid   = req.body.outletid
    const couponcode = req.body.couponcode

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

                try {
                    const product = await Product.findById(element.product);
                    if(variant==="default"){
                        price=product.price
                    } else {
                        const productItem = product.variants.find(item => item.variantName === variant)
                        price = productItem.price
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        error: "Error while trying to find the variant"
                    })
                }
                
                totalAmount += (price*element.quantity)
                totalQuantity += element.quantity
    
                productArr.push({
                    item: element.product,
                    variant: variant,
                    quantity: element.quantity
                })
            }

            if(couponcode!==undefined){
                try {
                    totalAmount = await addcoupon(req,res,userid,outletid,couponcode,totalAmount)
                } catch (error) {
                    console.log(err);
                    return res.status(500).json({
                        error: err
                    });
                }
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
            // if coupon exist, add it to order
            // Generate cashfree token and send to the frontend SDK
            .then(async newOrder => {
                try {
                    if(couponcode!=undefined){
                        await Order.updateOne({ _id: newOrder._id }, {
                            $set: { coupon: couponcode }
                        })
                        .exec()
                    }

                    const payment = await getPaymentToken(newOrder, outletid, result, req, res)
                    return res.status(201).json({
                        message: "Order added to the database and cashfree token successfully generated",
                        cf_order_id: payment.data.cf_order_id,
                        order_id: newOrder._id,
                        payment_session_id: payment.data.payment_session_id,
                        order_status: payment.data.order_status
                    })
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        error: error
                    })                    
                }
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

/**
 ** Get payment token- 
 * called on creation of a new order and generates a cashfree token for the frontend to handle.
 * 
 * TODO-
 * Add easy split
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

// delivers an item individually
module.exports.deliverItem = async (req,res) => {
    const productid = req.body.productid
    const variant   = req.body.variant
    const orderid   = req.body.orderid

    try {
        const order = await Order.findById(orderid);
        if (!order) {
            return res.status(404).json({
                error: "order not found"
            })
        }

        const productItem = order.products.find(item => item.item.toString() === productid && item.variant === variant)
        if (!productItem) {
            return res.status(404).json({
                error: "Product item not found"
            })
        }

        productItem.readyToDeliver = true;
        await order.save()
        return res.status(200).json({
            message: "Delived an item"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while trying to deilver an item"
        })
    }
}

/**
 * 1. An outlet will have two order arrays as follows:
 *      => active orders or preparing orders array A
 *      => completed orders array B
 * A new order will always be put in the acive orders array A
 * When this order is completed, it is moved to the completed orders array B from A
*/
module.exports.deliverEntireOrder = (req,res) => {
    const orderid  = req.body.orderid
    const ownerid  = req.userData.ownerid
    const outletid = req.body.outletid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0){
            Order.updateOne({ _id: orderid }, {
                $set: { status: "completed" }
            })
            .exec()
            .then(async result => {
                try {
                    await Outlet.updateOne({ _id: outletid }, {
                        $pull: { activeOrders: orderid }
                    })
                    .exec()
                    return result
                } catch (error) {
                    return res.status(500).json({
                        error: "Error while pulling the order from outlet's active orders array"
                    })
                }
            })
            .then(async result => {
                try {
                    await Outlet.updateOne({ _id: outletid }, {
                        $push: { completedOrders: orderid }
                    })
                    .exec()
                    return result
                } catch (error) {
                    return res.status(500).json({
                        error: "Error while pushing the order into outlet's completed orders array"
                    })
                }
            })
            .then(async result => {
                return res.status(200).json({
                    message: "Order marked completed and shifted from active array to completed in outlet"
                })
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({
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
        return res.status(500).json({
            error: err
        })
    })
}