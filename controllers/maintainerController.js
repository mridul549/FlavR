const Maintainer = require('../models/maintainer')
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const mongoose   = require('mongoose')
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
                const verification = user[0].verification
    
                if(!verification){
                    return res.status(409).json({
                        message: "Email already exits, complete verification."
                    })
                } else {
                    return res.status(409).json({
                        message: "User already exits, try logging in."
                    })
                }
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
                    .then(async result => {
                        /**
                         * the role determines whether it's a user, owner or maintainer
                         * user -> 0
                         * owner -> 1
                         * maintainer -> 2
                         */
                        const key = req.body.email
                        const role = 2
                        await mailQueue.add({ key, role })
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
                message: "Auth Failed- No Email found"
            })
        }
        const authMethod = maintainer[0].authMethod
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

module.exports.updateImage = (req,res) => {
    const maintainerid = req.userData.maintainerid

    Maintainer.find({ _id: maintainerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].maintainerPic.id

            if(imageidOld !== "null") {
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            if(req.files && req.files.newMaintainerImage) {
                const file = req.files.newMaintainerImage
                cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                    if(err) {
                        return res.status(500).json({
                            error: "image upload failed"
                        })
                    }
                    Maintainer.updateOne({ _id: maintainerid }, {
                        $set: { maintainerProfilePic: {
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
                return res.status(400).json({
                    error: "No file found to upload"
                })
            }
        } else {
            return res.status(404).json({
                error: "Maintainer not found"
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

module.exports.getMaintainerProfile = (req,res) => {
    const maintainerid = req.userData.maintainerid

    Maintainer.find({ _id: maintainerid })
    .select('_id maintainerName email maintainerPic')
    .exec()
    .then(result => {
        if(result.length>0) {
            return res.status(200).json({
                maintainer: result
            })
        } else {
            return res.status(404).json({
                error: "Maintainer not found!"
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

module.exports.updateMaintainer = (req,res) => {
    const maintainerid = req.userData.maintainerid

    Maintainer.find({ _id: maintainerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const updateOps = {};
            for(const ops of req.body.updates) {
                updateOps[ops.propName] = ops.value
            }
            Maintainer.updateOne({ _id: maintainerid }, {
                $set: updateOps
            })
            .exec()
            .then(result => {
                return res.status(200).json({
                    message: "Maintainer updated successfully"
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
                error: "Maintainer not found"
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

module.exports.deleteMaintainerImage = async (req,res) => {
    const maintainerid = req.userData.maintainerid

    Maintainer.find({ _id: maintainerid })
    .exec()
    .then(async result => {
        if(result.length>0) {
            const imageid = result[0].maintainerImage.imageid

            if(imageid!="null"){
                cloudinary.uploader.destroy(imageid, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })

                try {
                    await Maintainer.updateOne({ _id: maintainerid }, {
                        $set: {
                            "maintainerPic.url": "null",
                            "maintainerPic.id": "null"
                        }
                    })
                    .exec()
                } catch (error) {
                    console.log(err);
                    return res.status(500).json({
                        error: err
                    })
                }
                
                return res.status(200).json({
                    message: "Image deleted successfully"
                })
            } else {
                return res.status(400).json({
                    error: "No image exists for the maintainer"
                })
            }

        } else {
            return res.status(404).json({
                error: "No maintainer found"
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