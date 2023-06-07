const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const Queue      = require('bull');
const cashfree   = require('cashfree-pg-sdk-nodejs');
const crypto     = require('crypto')

const orderQueue = new Queue('orderQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

// Verifies the cashfree signature with the secret key
function verify(ts, rawBody){
    const body = ts + rawBody
    const secretKey = process.env.CF_API_KEY;
    let genSignature = crypto.createHmac('sha256',secretKey).update(body).digest("base64");
    return genSignature
}

module.exports.processPayment = (req,res) => {
    const paymentStatus = req.body.data.payment.payment_status
    const orderid = req.body.data.order.order_id
    const userid  = req.body.data.customer_details.customer_id
    
    const ts = req.headers["x-webhook-timestamp"]
    const signature = req.headers["x-webhook-signature"]  
    const currTs = Math.floor(new Date().getTime() / 1000)
    if(currTs - ts > 30000){
        res.send("Failed")
    }  
    const genSignature = verify(ts, req.rawBody)
    if(signature === genSignature){
        res.send('OK')

        switch (paymentStatus) {
            case "SUCCESS":
                paymentSuccess(req, res, orderid, userid)
                break;
        
            default:
                break;
        }

    } else {
        res.send("failed")
    } 
}

function paymentSuccess (req, res, orderid, userid) {
    console.log("I'm the payment method");
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