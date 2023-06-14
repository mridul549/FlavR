const Maintainer = require('../models/maintainer')
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const mongoose   = require('mongoose')

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
    Maintainer.find({ email: req.body.email })
    .exec()
    .then(maintainer => {
        if(maintainer.length>0) {
            const authMethod = maintainer[0].authMethod

            if(authMethod=="regular"){
                return res.status(409).json({
                    message: "Maintainer already exits, try logging in."
                })
            } else {
                return res.status(409).json({
                    message: "This email is already registered with us, use a different login method."
                })
            }

        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const maintainer = new Maintainer({
                        _id: new mongoose.Types.ObjectId,
                        maintainerName: req.body.maintainerName,
                        email: req.body.email,
                        password: hash,
                        authMethod: "regular"
                    })
                    maintainer
                    .save()
                    .then(result => {
                        console.log(result);
                        return res.status(201).json({
                            message: "Maintainer created"
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
    Maintainer.find({ email: req.body.email })
    .exec()
    .then(maintainer => {
        // for a regular authmethod maintainer
        if(maintainer.length<1){
            return res.status(401).json({
                message: "Auth Failed- No maintainer found"
            })
        }
        const authMethod = maintainer[0].authMethod
        if(authMethod=="google"){
            return res.status(409).json({
                message: "Password is not set for this account. Login using some other method."
            })
        }
        bcrypt.compare(req.body.password, maintainer[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    error: err
                })
            } 
            if(result) {
                const token = jwt.sign({
                    email: maintainer[0].email,
                    maintainerid: maintainer[0]._id,
                    maintainername: maintainer[0].maintainerName
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

function getTokenForGoogleAuth (maintainer,req,res) {
    const token = jwt.sign({
        email: maintainer.email,
        maintainerid: maintainer._id,
        maintainername: maintainer.maintainerName,
    }, process.env.TOKEN_SECRET, {
        expiresIn: "30 days"
    })
    return res.status(200).json({
        message: "Auth successful",
        token: token
    })
}

module.exports.google_Login_Signup = (req,res) => {
    const email = req.body.email

    Maintainer.find({ email: email })
    .exec()
    .then(result => {
        // no maintainer found with same credentials- sign the maintainer up
        if(result.length==0){
            // TODO- Update or add the details in future which are recieved through google
            // update the profile pic too
            const maintainer = new Maintainer({
                _id: new mongoose.Types.ObjectId,
                maintainerName: req.body.maintainerName,
                email: req.body.email,
                authMethod: "google"
            })
            maintainer
            .save()
            .then(newMaintainer => {
                getTokenForGoogleAuth(newMaintainer,req,res)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
        } else {
            // Log the maintainer in
            getTokenForGoogleAuth(result[0],req,res)
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}
