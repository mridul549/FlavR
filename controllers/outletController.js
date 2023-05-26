const { default: mongoose } = require('mongoose');
const Outlet                = require('../models/outlet');
const Owner                 = require('../models/owner');
const Product               = require('../models/product')
const qrcode                = require('qrcode');
const cloudinary            = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// in this we first search the database to check for an
// already existing outlet, if one is found we throw an error
// if not then we create one, add it to DB
// update the owner accordingly and exit
// while creating, we generate its qr code and upload it to database also
// also we can upload an image of outlet on creation itself (depends on owner)
module.exports.addOutlet = (req,res) => {
    const ownerID = req.userData.ownerid

    Outlet.find({
        // using the $and operator to search the DB with multiple conditions
        $and: [
            { outletName: req.body.outletName },
            { address: req.body.address },
            { owner: req.userData.ownerid }
        ]
    })
    .then(result => {
        if(result.length>0) {
            return res.status(404).json({
                message: "Outlet already exists"
            })
        } 
        
        let outletPromise;

        if (req.files && req.files.outletImage) {
            const file = req.files.outletImage;

            outletPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                    if (err) {
                        return reject(err);
                    }

                    const outlet = new Outlet({
                        _id: new mongoose.Types.ObjectId(),
                        outletName: req.body.outletName,
                        address: req.body.address,
                        owner: req.userData.ownerid,
                        outletImage: {
                            url: image.url,
                            imageid: image.public_id,
                        },
                    });

                    resolve(outlet.save());
                });
            });
        } else {
            const outlet = new Outlet({
                _id: new mongoose.Types.ObjectId(),
                outletName: req.body.outletName,
                address: req.body.address,
                owner: req.userData.ownerid,
                outletImage: {
                    url: "null",
                    imageid: "null",
                },
            });

            outletPromise = outlet.save();
        }

        return outletPromise;
    })
    .then(result => {
        // generates a qr code data url
        const qrCodePromise = new Promise((resolve, reject) => {
            qrcode.toDataURL(`${result._id}`, {
                errorCorrectionLevel: 'H',
                color: {
                    dark: '#000',  // black dots
                    light: '#fff' // white background
                }
            }, (err, qrdata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(qrdata);
                }
            });
        });
        // passing the outlet created and the data url to next promise
        return Promise.all([result, qrCodePromise]);
    })
    .then(([result, qrdata]) => {
        // uploading the genrated qr code to cloud
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(qrdata, (err, image) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ result, image });
                }
            });
        });
    })
    .then(async ({ result, image }) => {
        // updating the created outled with the cloud link just created
        try {
            await Outlet.updateOne({ _id: result._id }, {
                $set: {
                    "outletqr": {
                        url: image.url,
                        qrid: image.public_id
                    }
                }
            })
            .exec();
            return result;
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        }
    })
    .then(async result => {
        // createQRAndUpload(result, req, res)
        try {
            await Owner.updateOne({ _id: ownerID }, {
                $push: {
                    outlets: result._id
                }
            })
            .exec();
            return result;
        } catch (err) {
            return res.status(500).json({
                error: err
            });
        }
    })
    .then(result => {
        return res.status(201).json({
            message: "Outlet added successfully",
            createdOutlet: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.updateOutlet = (req,res) => {
    const outletid = req.params.outletid
    // not using the ownerid here, but accessing just to make sure
    // that only an owner can access this route and no regular user
    const ownerid = req.userData.ownerid

    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result) {
            const updateOps = {};
            for(const ops of req.body.updates) {
                updateOps[ops.propName] = ops.value
            }
            Outlet.updateOne({ _id: outletid }, {
                $set: updateOps
            })
            .exec()
            .then(result => {
                return res.status(201).json({
                    message: "Outlet Updated successfully",
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
                error: "You don't have access to this route"
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

// 0. Find an outlet
// 1. If outlet image present, remove it from cloud
// 2. Delete qr from cloud
// 3. remove outlet from DB
// 4. remove outlet from owner's outlet array
// 5. romove all products from products array in owner schema of an outlet
// 6. romove all products of this outlet
// using async functions here, as suggested by vs code
module.exports.deleteOutlet = (req,res) => {
    const outletid = req.body.outletid
    const ownerid = req.userData.ownerid

    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].outletImage.imageid
            const qrid       = result[0].outletqr.qrid

            if(imageidOld!=="null") {
                // deleting outlet image from cloud if exits
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            // deleteing qr from cloud
            cloudinary.uploader.destroy(qrid, (err,result) => {
                if(err) {
                    return res.status(500).json({
                        error: "error in deleting the old image"
                    })
                }
            })

            Outlet.deleteOne({ _id: outletid })
            .exec()
            .then(async result => {
                await Owner.updateOne({ _id: ownerid }, {
                    $pull: { outlets: outletid }
                })
                .exec();
                return result;
            })
            .then(async result => {
                await Owner.updateMany({ _id: ownerid }, {
                    $pull: { products: { outlet: outletid }}
                })
                .exec();
                return result
            })
            .then(async result => {
                await Product.deleteMany({ outlet: outletid })
                .exec();
                return result;
            })
            .then(result => {
                return res.status(201).json({
                    message: "Outlet deleted successfully"
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
                error: "Cant find an outlet"
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

module.exports.getMenuSize = (req,res) => {
    const outletid = req.query.outletid
    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result.length>0) {
            return res.status(201).json({
                menuSize: result[0].menu.length
            })
        } else {
            return res.status(201).json({
                error: "Outlet doesn't exist"
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
    const outletid = req.params.outletid

    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result.length>0) {
            const imageidOld = result[0].outletImage.imageid

            if(imageidOld !== "null") {
                cloudinary.uploader.destroy(imageidOld, (err,result) => {
                    if(err) {
                        return res.status(500).json({
                            error: "error in deleting the old image"
                        })
                    }
                })
            }

            const file = req.files.newOutletImage

            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(500).json({
                        error: "image upload failed"
                    })
                }
                Outlet.updateOne({ _id: outletid }, {
                    $set: { outletImage: {
                        url: image.url,
                        imageid: image.public_id
                    }}
                })
                .exec()
                .then(docs => {
                    return res.status(201).json({
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
                error: "Outlet not found"
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

module.exports.getOutlet = (req,res) => {
    const ownerid  = req.userData.ownerid
    const outletid = req.query.outletid

    Owner.find({ _id: ownerid })
    .exec()
    .then(result => {
        if(result.length>0) {
            Outlet.find({ _id: outletid })
            .select('_id outletName address owner outletImage outletqr createdAt updatedAt')
            .exec()
            .then(result => {
                return res.status(201).json({
                    result
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
                error: "No owner found"
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
