// TODO- Change the secret key

const mongoose = require('mongoose');
const User     = require('../models/user');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const Product  = require('../models/product')
const client   = require('twilio')('ACba1e76922a2edca140aee5defed46e55','')

client.messages
  .create({
    body: 'Hello from twilio-node',
    to: '+12345678901', // Text your number
    from: '+12345678901', // From a valid Twilio number
  })
.then((message) => console.log(message.sid));

module.exports.signup = (req,res) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length>=1) {
            return res.status(409).json({
                message: "User already exits"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId,
                        userName: req.body.userName,
                        email: req.body.email,
                        password: hash
                    })
                    user
                    .save()
                    .then(result => {
                        console.log(result);
                        return res.status(201).json({
                            message: "User created"
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.login = (req,res) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length<1){
            return res.status(401).json({
                message: "Auth Failed"
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    error: err
                })
            } 
            if(result) {
                const token = jwt.sign({
                    email: user[0].email,
                    userid: user[0]._id,
                    username: user[0].userName
                }, "nescafeAppSecretKey", {
                    expiresIn: "30 days"
                })
                return res.status(200).json({
                    message: "Auth successful",
                    token: token
                })
            }
            return res.status(401).json({
                message: "Auth failed"
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// adds a single product to cart with its product id and quantity
module.exports.addOneProductToCart = (req,res) => {
    User.updateOne({ _id: req.userData.userid }, {
        $push: {
            cart: {
                product: req.body.productid,
                quantity: req.body.quantity
            }
        }
    })
    .exec()
    .then(result => {
        Product.find( {_id: req.body.productid} )
        .select('_id category productName description price')
        .exec()
        .then(result => {
            return res.status(201).json({
                message: "Product added to cart",
                product: result,
                quantity: req.body.quantity
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.addProductsToCart = (req,res) => {
    const items = req.body.items
    const userid = req.userData.userid

    User.find({ _id: userid })
    .exec()
    .then(result => {
        if(result.length>0) {
            User.updateOne({ _id: userid }, {
                $push: {
                    cart: {
                        $each: items
                    }
                }
            })
            .exec()
            .then(result => {
                return res.status(201).json({
                    message: "Cart updated successfully",
                    itemsAdded: items
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
        } else {
            return res.status(404).json({
                error: "User not found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.getCartItems = (req,res) => {
    User.find({ _id: req.userData.userid })
    .populate('cart.product', '_id category productName description price productImage')
    .exec()
    .then(result => {
        return res.status(201).json({
            size: result[0].cart.length,
            cart: result[0].cart
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.getCartSize = (req,res) => {
    User.find({ _id: req.userData.userid })
    .exec()
    .then(result => {
        return res.status(201).json({
            size: result[0].cart.length,
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

// update a cart element quantity
// if quantity is 0 it is removed
// else it is updated to the obtained
module.exports.updateQuantity = (req,res) => {
    const quantity = req.body.quantity
    const userid = req.userData.userid
    const cartElementID = req.body.cartEleid

    if(quantity==0) {
        User.updateOne({ _id: userid, "cart._id": cartElementID }, {
            $pull: {
                "cart": {
                    _id: cartElementID
                }
            }
        })
        .exec()
        .then(result => {
            return res.status(201).json({
                message: "Product removed from cart"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
    } else {
        User.updateOne({ _id: userid, "cart._id": cartElementID }, {
            $set: {
                "cart.$.quantity": quantity
            }
        })
        .exec()
        .then(result => {
            return res.status(201).json({
                message: "Quantity Updated successfully"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
    }
}

module.exports.clearCart = (req,res) => {
    const userid = req.userData.userid

    User.updateOne({ _id: userid }, {
        $pull: {
            cart: {
                $exists: true
            }
        }
    })
    .exec()
    .then(result => {
        return res.status(201).json({
            message: "Cleared cart",
            ACK: result
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.removeProductCart = (req,res) => {
    const userid = req.userData.userid
    const productid = req.body.productid

    User.updateOne({ _id: userid }, {
        $pull: {
            "cart": {
                "product": productid
            }
        }
    })
    .exec()
    .then(result => {
        return res.status(201).json({
            message: "Product removed from cart"
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}