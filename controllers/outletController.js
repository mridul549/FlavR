const { default: mongoose } = require('mongoose');
const Outlet = require('../models/outlet');
const Owner = require('../models/owner');

// in this we first search the database to check for an
// already existing outlet, if one is found we throw an error
// if not then we create one, add it to DB
// update the owner accordingly and exit
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
        
        const outlet = new Outlet({
            _id: new mongoose.Types.ObjectId,
            outletName: req.body.outletName,
            address: req.body.address,
            owner: req.userData.ownerid,
        })
        
        return outlet.save()
    })
    .then(result => {
        Owner.updateOne({_id: ownerID}, {
            $push: {
                outlets: result._id
            }
        })
        .exec()
        .then()
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
        
        res.status(201).json({
            message: "Outlet added successfully",
            createdOutlet: result
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.updateOutlet = (req,res) => {
    const outletid = req.params.productid
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