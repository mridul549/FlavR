// TODO- Change the secret key

const mongoose = require('mongoose');
const Owner    = require('../models/owner');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');

module.exports.signup = (req,res) => {
    Owner.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length>=1) {
            return res.status(409).json({
                message: "Owner already exits"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const owner = new Owner({
                        _id: new mongoose.Types.ObjectId,
                        ownerName: req.body.ownerName,
                        email: req.body.email,
                        password: hash
                    })
                    owner
                    .save()
                    .then(result => {
                        console.log(result);
                        return res.status(201).json({
                            message: "Owner created"
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
    Owner.find({email: req.body.email})
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
                    ownerid: user[0]._id,
                    ownername: user[0].ownerName,
                    outlets: user[0].outlets
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