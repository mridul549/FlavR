const { default: mongoose } = require('mongoose');
const Outlet                = require('../models/outlet');
const Owner                 = require('../models/owner');
const Product               = require('../models/product')
const qrcode                = require('qrcode');
const cloudinary            = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dokgv4lff', 
    api_key: '687314849365117', 
    api_secret: '69qpxc0ho_-nT76tegOQEau711I',
    secure: true
});

function uploadOutletImage (outlet, req, res) {
    outlet.save()
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
        res.status(201).json({
            message: "Outlet added successfully",
            createdOutlet: result
        })
    })
}

// in this we first search the database to check for an
// already existing outlet, if one is found we throw an error
// if not then we create one, add it to DB
// update the owner accordingly and exit
// while creating, we generate its qr code and upload it to database also
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
        
        var imageProp = {
            url: "null",
            qrid: "null"
        }

        const outletwofile = new Outlet({
            _id: new mongoose.Types.ObjectId,
            outletName: req.body.outletName,
            address: req.body.address,
            owner: req.userData.ownerid,
            outletqr: imageProp
        })
        
        if(req.files && req.files.outletImage) {
            const file = req.files.outletImage
            cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
                if(err) {
                    return res.status(500).json({
                        error: "image upload failed"
                    })
                }
    
                imageProp = {
                    url: image.url,
                    imageid: image.public_id
                }

                const outletwfile = new Product({
                    _id: new mongoose.Types.ObjectId,
                    outletName: req.body.outletName,
                    address: req.body.address,
                    owner: req.userData.ownerid,
                    outletqr: imageProp
                })
                uploadOutletImage(outletwfile, req, res)
            })
        } else {
            uploadOutletImage(outletwofile, req, res)
        }
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
// 1. remove outlet from DB
// 2. remove outlet from owner's outlet array
// 3. romove all products from products array in owner schema of an outlet
// 4. romove all products of this outlet
// using async functions here, as suggested by vs code
module.exports.deleteOutlet = (req,res) => {
    const outletid = req.body.outletid
    const ownerid = req.userData.ownerid

    Outlet.find({ _id: outletid })
    .exec()
    .then(result => {
        if(result.length>0) {
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
    const outletid = req.body.outletid
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

