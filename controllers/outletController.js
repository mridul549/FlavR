const { default: mongoose } = require('mongoose');
const Outlet = require('../models/outlet');

module.exports.addOutlet = (req,res) => {
    Outlet.find({
        // using the $and operator to search the DB with multiple conditions
        $and: [
            { outletName: req.body.outletName },
            { address: req.body.address },
            { owner: req.userData.ownerid }
        ]
    })
    .then(result => {
        if(!result) {
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