const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const Coupon     = require('../models/coupon');
const Socket     = require('../models/socket');
const axios      = require('axios');
const Queue      = require('bull');
const {wss}      = require('../app')

wss.on('connection', (ws) => {
    ws.on('message', async function message(data) {
        const parsedData = JSON.parse(data)

        await Socket.findOneAndUpdate({ orderid: parsedData.orderid },
            {
                $set: {
                    orderid: parsedData.orderid
                }, 
            },
            { upsert: true, new: true }
        )

        wss.clients.forEach(function each(client) {
            client.send(`recieved order ${parsedData.orderid}`);
        });
    });
});

const orderQueue = new Queue('orderQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

module.exports.checkSocket = (req,res) => {

    wss.clients.forEach(function each(client) {
        const data = {
            orderid: "6483550a4eb7f26433a02789",
            status: "Preparing"
        }
        client.send(data.toString());
    });
    return res.status(200).json({
        message: "Check"
    })

}

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

                    if(coupon[0].createdBy!==userid){
                        return res.status(400).json({
                            error: "BAD REQUEST",
                            message: "Coupon does not belong to you."
                        })
                    }

                    if(coupon[0].discount>totalAmount){
                        return res.status(422).json({
                            error: "Unprocessable Entity",
                            message: "Coupon amount is greater than total price of items to be ordered."
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
    let instructions = req.body.instructions

    User.find({ _id: userid })
    .exec()
    .then(async result => {
        if(result.length>0) {
            let totalAmount=0, totalQuantity=0;
            const cart = result[0].cart.products
            const productArr = []

            if(cart.length==0){
                return res.status(400).json({
                    error: "Cart is empty"
                })
            }


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

            if(instructions===undefined){
                instructions={
                    packOrder: false,
                    message: "No special instructions"
                }
            }


            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                user: userid,
                outlet: outletid,
                products: productArr,
                totalPrice: totalAmount,
                totalQuantity: totalQuantity,
                instructions: instructions
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
                        $pull: { activeOrders: orderid },
                        $push: { completedOrders: orderid }
                    })
                    .exec()
                    return res.status(200).json({
                        message: "Order marked completed and shifted from active array to completed in outlet"
                    })
                } catch (error) {
                    return res.status(500).json({
                        error: "Error while updating outlet orders"
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

module.exports.getOrder = (req,res) => {
    const orderid = req.query.orderid

    Order.find({ _id: orderid })
    .populate('products.item', '_id category productName description price veg productImage')
    .exec()
    .then(result => {
        return res.status(200).json({
            order: result
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
 * If order confirmed, update status, remove it from pending confirmation orders 
 * and add it to active orders and then finally add it to the order queue
 * 
 * else if order rejected, remove it from pending confirmation orders
 *      method of refund?
 *          coupon         -> 
 *          money transfer -> 
 *      delete order from DB
 * 
 */
module.exports.order_confirm_reject = (req,res) => {
    const isConfirm = req.body.isConfirm
    const outletid  = req.body.outletid
    const orderid   = req.body.orderid
    const ownerid   = req.userData.ownerid

    Outlet.find({ _id: outletid })
    .exec()
    .then(async outlet => {
        if(outlet.length>0){
            if(outlet[0].owner.toString()===ownerid){
                try {
                    const order = await Order.findById(orderid)

                    const pendingConfItem = outlet[0].pendingConfOrders.find(item => item.toString() === orderid);
                    outlet[0].pendingConfOrders.pull(orderid)
                    if(isConfirm) {
                        await orderQueue.add({ orderid, outletid })
                        order.status = "PREPARING"
                        outlet[0].activeOrders.push(orderid)
                    } else {
                        order.status = "REJECTED"
                    }
                    
                    await order.save()
                    await outlet[0].save()

                    const orderStatement = (isConfirm) ? 
                        "Order successfully confirmed and sent for futher processing." : 
                        "Order rejected and refund or coupon has been successfully initiated."

                    return res.status(200).json({
                        message: orderStatement 
                    })

                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        error: error
                    })    
                }
            } else {
                return res.status(401).json({
                    error: "Unauthorised access to outlet"
                })
            }
        } else {
            return res.status(404).json({
                error: "Outlet not found"
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

module.exports.getOrders = (req,res) => {
    Order.find({ user: req.userData.userid })
    .populate('products.item', '_id category productName description price veg productImage')
    .exec()
    .then(result => {
        return res.status(200).json({
            result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}