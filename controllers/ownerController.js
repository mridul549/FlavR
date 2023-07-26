// TODO- Change the secret key

const mongoose   = require('mongoose');
const Owner      = require('../models/owner');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Queue      = require('bull');

const mailQueue = new Queue('mailQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

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
    return res.status(200).json({
        newToken: newToken
    })
}

module.exports.signup = (req,res) => {
    Owner.find({email: req.body.email})
    .exec()
    .then(owner => {
        if(owner.length>=1) {
            const authMethod = owner[0].authMethod

            if(authMethod=="regular"){
                const verification = owner[0].verification
    
                if(!verification){
                    return res.status(409).json({
                        message: "Email already exits, log in and complete verfication"
                    })
                } 
                return res.status(409).json({
                    message: "Email already exits, try logging in."
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
                    const owner = new Owner({
                        _id: new mongoose.Types.ObjectId,
                        ownerName: req.body.ownerName,
                        email: req.body.email,
                        password: hash,
                        authMethod: "regular"
                    })
                    owner
                    .save()
                    .then(async result => {
                        /**
                         * the role determines whether it's a user, owner or maintainer
                         * user -> 0
                         * owner -> 1
                         * maintainer -> 2
                         */
                        const key = req.body.email
                        const role = 1
                        await mailQueue.add({ key, role })
                        return res.status(201).json({
                            action: "Owner created and OTP Sent",
                            message: "Please check your mailbox for the OTP verification code."
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
                message: "Auth Failed- No Email found"
            })
        }
        const authMethod = user[0].authMethod
        if(authMethod=="google"){
            return res.status(409).json({
                message: "Password is not set for this account. Login using some other method."
            })
        }
        const verification = user[0].verification
        if(!verification) {
            return res.status(409).json({
                message: "Email is not verified, please complete verification"
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
                    ownername: user[0].ownerName
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

module.exports.forgetPassword = (req,res) => {
    const newPassword = req.body.newPassword
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length<1){
            return res.status(401).json({
                message: "Auth Failed- No owner found"
            })
        }
        const authMethod = result[0].authMethod
        if(authMethod=="google"){
            return res.status(409).json({
                message: "Password is not set for this account."
            })
        }

        bcrypt.hash(newPassword, 10, (err, hash) => {
            if(err){
                return res.status(500).json({
                    message: err
                })
            } else {
                Owner.updateOne({ _id: ownerid }, {
                    $set: { password: hash }
                })
                .exec()
                .then(updatePass => {
                    return res.status(200).json({
                        message: "Password successfully updated"
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        message: "Error while updating password!!"
                    })
                })
            }
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            message: err
        })
    })
}

module.exports.resetPassword = (req,res) => {
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length<1){
            return res.status(401).json({
                message: "Auth Failed- No owner found"
            })
        }
        const authMethod = result[0].authMethod
        if(authMethod=="google"){
            return res.status(409).json({
                message: "Password is not set for this account."
            })
        }
        bcrypt.compare(oldPassword, result[0].password, (err, result) => {
            if(err) {
                return res.status(500).json({
                    error: err
                })
            } 
            if(result) {
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        Owner.updateOne({ _id: ownerid }, {
                            $set: { password: hash }
                        })
                        .exec()
                        .then(updatePass => {
                            return res.status(200).json({
                                message: "Password successfully updated"
                            })
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(500).json({
                                error: err
                            })
                        })
                    }
                })
            }else {
                return res.status(401).json({
                    message: "Old password entered is wrong."
                })
            }
        })

    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

}

function getTokenForGoogleAuth (user,req,res) {
    const token = jwt.sign({
        email: user.email,
        ownerid: user._id,
        ownername: user.userName,
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

    Owner.find({ email: email })
    .exec()
    .then(result => {
        // no owner found with same credentials- sign the owner up
        if(result.length==0){
            // TODO- Update or add the details in future which are recieved through google
            // update the profile pic too
            const owner = new Owner({
                _id: new mongoose.Types.ObjectId,
                ownerName: req.body.ownerName,
                email: req.body.email,
                ownerProfilePic: {
                    url: req.body.profileUrl
                },
                verification: true,
                authMethod: "google"
            })
            owner
            .save()
            .then(newOwner => {
                getTokenForGoogleAuth(newOwner,req,res)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
        } else {
            // Log the Owner in
            const authMethod = result[0].authMethod
            if(authMethod==='regular'){
                return res.status(400).json({
                    message: "Please use normal login"
                })
            }
            else {
                getTokenForGoogleAuth(result[0],req,res)
            }
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.verifyOwner = (req,res) => {
    const email = req.body.email

    Owner.updateOne({ email: email }, {
        $set: { verification: true }
    })
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "Owner verified"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

// to be used to transfer ownership of an outlet
module.exports.addOutlet = (req,res) => {
    const ownerid = req.userData.ownerid
    const outletid = req.body.outletid

    Owner.updateOne({ _id: ownerid }, {
        $push: {
            outlets: outletid
        }
    })
    .exec()
    .then(result => {
        return res.status(201).json({
            message: "Outlet added successfully"
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.getOutlets = (req,res) => {
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .populate('outlets')
    .exec()
    .then(result => {
        if(result){
            return res.status(200).json({
                outlets: result[0].outlets
            })
        } else {
            return res.status(404).json({
                error: "No outlets found"
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

/*
    * TO BE DEALT WITH LATER
    Updation keys:
    1. Name
    2. Email (redirect to another route in that case on clicking button on app)

    Possibilities in future:
    1. Mobile (add in DB)
    2. DOB
    3. Gender
*/

module.exports.updateOwner = (req,res) => {
    const ownerid = req.userData.ownerid
    const ownername = req.body.ownerName
    const email = req.body.email

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            Owner.updateOne({ _id: ownerid }, {
                $set: {
                    ownerName: ownername,
                    email: email
                }
            })
            .exec()
            .then(result => {
                return res.status(200).json({
                    message: "Owner updated successfully"
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
                error: "Owner not found"
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

module.exports.updateImage = (req,res) => {
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].ownerProfilePic.id

            if(imageidOld !== "null") {
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            const file = req.files.newOwnerImage

            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(500).json({
                        error: "image upload failed"
                    })
                }
                Owner.updateOne({ _id: ownerid }, {
                    $set: { ownerProfilePic: {
                        url: image.url,
                        id: image.public_id
                    }}
                })
                .exec()
                .then(docs => {
                    return res.status(200).json({
                        message: "Image updated successfully",
                        url: image.url
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
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

/*
    1. Delete owner
    2. Delete its profile pic from database
*/
module.exports.deleteOwner = (req,res) => {

}

module.exports.getOwnerProfile = (req,res) => {
    const owneremail = req.query.ownermail

    Owner.find({ email: owneremail })
    .select('_id ownerName email outlets ownerProfilePic')
    .exec()
    .then(result => {
        if(result.length>0) {
            return res.status(201).json({
                owner: result
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