const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Coupon     = require('../models/coupon');
const Order      = require('../models/order');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const mongoose   = require('mongoose');
const crypto     = require('crypto');
const Queue      = require('bull');
const firebase    = require('../config/firebase')
const orderfb    = firebase.collection('Order')
const { getMessaging } = require('firebase-admin/messaging');

const orderQueue = new Queue('orderQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

module.exports.generateCouponCode = (req,res) => {
    const userid   = req.userData.userid
    const outletid = req.body.outletid 
    const amount   = req.body.discount

    User.find({ _id: userid})
    .exec()
    .then(async result =>  {
        if(result.length>0) {
            const { customAlphabet } = await import('nanoid');
            const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            const nanoid = customAlphabet(alphabet, 10);
            const nano = nanoid()
            const date = new Date()

            const coupon = new Coupon({
                code: nano,
                discount: amount,
                validity: {
                    until: date.setDate(date.getDate()+60)
                },
                outlet: outletid,
                createdBy: userid
            })

            coupon.save()
            .then(async gencoupon => {
                await User.updateOne({ _id: userid },{
                    $push: { coupons: gencoupon._id}
                })
                .exec()
                return gencoupon
            })
            .then(async gencoupon => {
                return res.status(201).json({
                    message: "Coupon generated successfully!",
                    coupon: gencoupon
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
                error: "No user found"
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


// Verifies the cashfree signature with the secret key
function verify(ts, rawBody){
    const body = ts + rawBody
    const secretKey = process.env.CF_API_KEY;
    let genSignature = crypto.createHmac('sha256',secretKey).update(body).digest("base64");
    return genSignature
}

module.exports.processPayment = (req,res) => {
    const ts = req.headers["x-webhook-timestamp"]
    const signature = req.headers["x-webhook-signature"]  
    const currTs = Math.floor(new Date().getTime() / 1000)
    if(currTs - ts > 30000){
        res.send("Failed")
    }  
    const genSignature = verify(ts, req.rawBody)
    if(signature === genSignature){
        res.send('OK')
        const paymentStatus = req.body.data.payment.payment_status
        const orderid  = req.body.data.order.order_id
        const orderAmount = req.body.data.order.order_amount
        const userid   = req.body.data.customer_details.customer_id
        const outletid = req.body.data.order.order_tags.outlet_id
        switch (paymentStatus) {
            case "SUCCESS":
                paymentSuccess(req,res,orderid,userid,outletid,orderAmount)
                break;
            case "FAILED":
                // paymentFailed_UserDropped(req,res,orderid)
                break;
            case "USER_DROPPED":
                // paymentFailed_UserDropped(req,res,orderid)
                break;
            default:
                break;
        }

    } else {
        res.send("failed")
    } 
}

/**
 * TODO-
    * update order payment status- done in queue processor
    * Assign order number using bull- done
    * Add order to outlet and user- done
 */
async function paymentSuccess (req, res, orderid, userid, outletid, orderAmount) {
    User.findByIdAndUpdate(userid, {
        $push: { orders: orderid },
        $set: { cart: {} }
    })
    .exec()
    .then(async result => {
        try {
            await Outlet.findByIdAndUpdate(outletid, {
                $push: { pendingConfOrders: orderid }
            })
            .exec();
            return result
        } catch (err) {
            return res.status(500).json({
                error: err
            });
        }
    })
    .then(async result => {
        Order.findByIdAndUpdate(orderid, {
            $set: { payment: true, status: "PAYMENT_RECIEVED" }
        })
        .exec()
        .then(async result => {
            // ADD to firebase
            const orderRef = orderfb.where('orderid', '==', orderid)
            const snapshot = await orderRef.get();
            if (snapshot.empty) {
                console.log("No matching document found.");
            } else {
                snapshot.forEach((doc) => {
                    doc.ref.update({ status: "PAYMENT_RECIEVED" });
                });
            }

        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            })
        })
    })
    .then(async result => {
        const user = await User.find({ _id: userid })
        const fcm_token = user[0].fcm_token

        const message = {
            data: {
                title: "Order Recieved",
                body: `We have successfully recieved your order. It is being processed and will be delivered soon.`,
            },
            token: fcm_token
        }

        await getMessaging().send(message)
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

// just delete the order from the system and retry payment
async function paymentFailed_UserDropped (req,res,orderid) {
    try {
        await Order.deleteOne({ _id: orderid })
        .exec()
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
}


















// {
//     "data": {
//       "order": {
//         "order_id": "647f8658b0f300afbcdec62d",
//         "order_amount": 320,
//         "order_currency": "INR",
//         "order_tags": null
//       },
//       "payment": {
//         "cf_payment_id": 1491868922,
//         "payment_status": "FAILED",
//         "payment_amount": 320,
//         "payment_currency": "INR",
//         "payment_message": "Your transaction has failed.",
//         "payment_time": "2023-06-07T00:48:26+05:30",
//         "bank_reference": null,
//         "auth_id": null,
//         "payment_method": {
//           "upi": {
//             "channel": null,
//             "upi_id": null
//           }
//         },
//         "payment_group": "upi"
//       },
//       "customer_details": {
//         "customer_name": "mridul549",
//         "customer_id": "646af415dacece58bf9a92f9",
//         "customer_email": "mridulverma0917@gmail.com",
//         "customer_phone": "7009100026"
//       },
//       "error_details": {
//         "error_code": null,
//         "error_description": null,
//         "error_reason": null,
//         "error_source": null,
//         "error_code_raw": null,
//         "error_description_raw": null
//       },
//       "payment_gateway_details": {
//         "gateway_name": null,
//         "gateway_order_id": null,
//         "gateway_payment_id": null,
//         "gateway_status_code": null,
//         "gateway_settlement": "DIRECT"
//       },
//       "payment_offers": null
//     },
//     "event_time": "2023-06-07T00:48:35+05:30",
//     "type": "PAYMENT_FAILED_WEBHOOK"
//   }