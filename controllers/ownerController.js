// TODO- Change the secret key

const mongoose   = require('mongoose');
const Owner      = require('../models/owner');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
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
    return res.status(200).json({
        newToken: newToken
    })
}

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

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const updateOps = {};
            for(const ops of req.body.updates) {
                updateOps[ops.propName] = ops.value
            }
            Owner.updateOne({ _id: ownerid }, {
                $set: updateOps
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
                        message: "Image updated successfully"
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
    const ownerid = req.userData.ownerid

    Owner.find({ _id: ownerid })
    .select('_id ownerName email outlets ownerProfilePic')
    .exec()
    .then(result => {
        if(result.length>0) {
            return res.status(201).json({
                owner: result
            })
        } else {
            return res.status(404).json({
                error: "Owner not found!"
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