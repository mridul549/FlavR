// TODO- Change the secret key

const mongoose   = require('mongoose');
const User       = require('../models/user');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const Product    = require('../models/product')
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

module.exports.getNewToken = (req,res) => {
    const oldToken = req.headers.authorization.split(" ")[1];
    const decodedPayload = jwt.decode(oldToken);
    delete decodedPayload.exp;
    const newToken = jwt.sign(decodedPayload, process.env.TOKEN_SECRET, {
        expiresIn: "30 days"
    })
    return res.status(201).json({
        newToken: newToken
    })
}

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
                }, process.env.TOKEN_SECRET, {
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
    console.log(items);
    User.find({ _id: userid })
    .exec()
    .then(result => {
        if(result.length>0) {
            User.updateOne({ _id: userid }, {
                $set: { cart: items }
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
        return res.status(200).json({
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
        return res.status(200).json({
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
module.exports.updateQuantity = async (req,res) => {
    const productid = req.body.productid
    const variant   = req.body.variant
    const quantity  = req.body.quantity
    const userid    = req.userData.userid

    try {
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }
    
        const cartItem = user.cart.find(item => item.product.toString() === productid && item.variant === variant);
        if (!cartItem) {
            return res.status(404).json({
                error: "Cart item not found"
            })
        }
    
        if (quantity === 0) {
            user.cart.pull(cartItem);
            await user.save();
            return res.status(200).json({
                message: "Item removed from cart"
            })
        } else {
            cartItem.quantity = quantity;
            await user.save();
            return res.status(200).json({
                message: "Cart item updated successfully!"
            })
        }
    
    } catch (error) {
        return res.status(500).json({
            error: "error while updating cart item"
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
        return res.status(200).json({
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

module.exports.removeProductCart = async (req,res) => {
    const userid = req.userData.userid
    const productid = req.body.productid
    const variant = req.body.variant

    const user = await User.findById(userid);
    try {
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }
    
        const cartItem = user.cart.find(item => item.product.toString() === productid && item.variant === variant);
        if (!cartItem) {
            return res.status(404).json({
                error: "Cart item not found"
            })
        }
    
        user.cart.pull(cartItem);
        await user.save();
        return res.status(200).json({
            message: "Item removed from cart"
        })
    } catch (error) {
        return res.status(500).json({
            error: "Couldn't remove product from cart"
        })   
    }
}

module.exports.updateImage = (req,res) => {
    const userid = req.userData.userid

    User.find({ _id: userid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].userProfilePic.id

            if(imageidOld !== "null") {
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            const file = req.files.newUserImage

            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(500).json({
                        error: "image upload failed"
                    })
                }
                User.updateOne({ _id: userid }, {
                    $set: { userProfilePic: {
                        url: image.url,
                        id: image.public_id
                    }}
                })
                .exec()
                .then(docs => {
                    return res.status(200).json({
                        message: "Image updated successfully"
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        error: err
                    })
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

module.exports.getUserProfile = (req,res) => {
    const userid = req.userData.userid

    User.find({ _id: userid })
    .select('_id userName email orders userProfilePic')
    .exec()
    .then(result => {
        if(result.length>0) {
            return res.status(201).json({
                user: result
            })
        } else {
            return res.status(404).json({
                error: "User not found!"
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