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
