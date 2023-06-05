const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');
const Queue      = require('bull');
const cashfree = require("cashfree-pg-sdk-nodejs");
const sdk = require('api')('@cashfreedocs-new/v3#9qqu7am5li0449pa');
const axios = require('axios');

var cfConfig = new cashfree.CFConfig(cashfree.CFEnvironment.SANDBOX, "2022-01-01", process.env.CF_APP_ID, process.env.CF_API_KEY);

const orderQueue = new Queue('orderQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

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
            // TODO- COLLECT PAYMENT
            .then(async newOrder => {
                const payment = await getPaymentToken(newOrder, result, req, res)
                return newOrder

                // var customerDetails = new cashfree.CFCustomerDetails();
                // customerDetails.customerId = "some_random_id";
                // customerDetails.customerPhone = "9999999999";
                // customerDetails.customerEmail = "b.a@cashfree.com";
                // var d = {};
                // d["order_tag_01"] = "TESTING IT";
                
                // var cFOrderRequest = new cashfree.CFOrderRequest();
                // cFOrderRequest.orderAmount = 100;
                // cFOrderRequest.orderCurrency = "INR";
                // cFOrderRequest.customerDetails = customerDetails;
                // cFOrderRequest.orderTags = d;

                // try {
                //     var apiInstance = new cashfree.CFPaymentGateway();

                //     var result = await apiInstance.orderCreate(
                //         cfConfig,
                //         cFOrderRequest
                //     );
                //     if (result != null) {
                //         // console.log(result?.cfOrder?.paymentSessionId);
                //         // console.log(result?.cfOrder?.orderId);
                //         // console.log(result?.cfHeaders);
                //         console.log(result);
                //     }
                // } catch (e) {
                //     console.log(e);
                // }
                // return newOrder
            })

            // ASSIGN ORDER NUMBER by adding to queue
            .then(async newOrder => {
                const orderid = newOrder._id
                await orderQueue.add({ orderid })
                return newOrder
            })

            // TODO- ADD THE ORDER TO THE OUTLET
            // .then(async result => {

            // })

            .then(result => {
                return res.status(201).json({
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

getPaymentToken = async (neworder, user, req, res) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CF_APP_ID,
        'x-client-secret': process.env.CF_API_KEY,
        'x-api-version': '2022-09-01',
        'x-request-id': 'developer_name'
    };
    
    const data = {
    order_amount: 1.0,
    order_id: 'dbwbdjw82',
    order_currency: 'INR',
    customer_details: {
        customer_id: '32132143',
        customer_name: 'customer_name',
        customer_email: 'customer_email',
        customer_phone: 7009100026
    },
    order_meta: {
        notify_url: 'https://test.cashfree.com'
    },
    order_note: 'some order note here'
    };

    try {
        const response = await axios.post('https://sandbox.cashfree.com/pg/orders', data, { headers });
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

/*
    var customerDetails = new cashfree.CFCustomerDetails();
    customerDetails.customerId = "some_random_id";
    customerDetails.customerPhone = "9999999999";
    customerDetails.customerEmail = "b.a@cashfree.com";
    var d = {};
    d["order_tag_01"] = "TESTING IT";
    
    var cFOrderRequest = new cashfree.CFOrderRequest();
    cFOrderRequest.orderAmount = 1;
    cFOrderRequest.orderCurrency = "INR";
    cFOrderRequest.customerDetails = customerDetails;
    cFOrderRequest.orderTags = d;

    try {
        var apiInstance = new cashfree.CFPaymentGateway();

        var result = await apiInstance.orderCreate(
            cfConfig,
            cFOrderRequest
        );
        if (result != null) {
            console.log(result?.cfOrder?.paymentSessionId);
            console.log(result?.cfOrder?.orderId);
            console.log(result?.cfHeaders);
        }
        return newOrder
    } catch (e) {
        console.log(e);
    }

 */

    