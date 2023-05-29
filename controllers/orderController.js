const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const Outlet     = require('../models/outlet');
const Owner      = require('../models/owner');
const User       = require('../models/user');

/* 
    1. get all items in cart
    2. calculate total price
    3. update the order schema accordingly
    4. 

*/
module.exports.placeOrder = async (req, res) => {
    User.find({ _id: req.userData.userid })
    .exec()
    .then(result => {
        const cart = result[0].cart
        
        


    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}