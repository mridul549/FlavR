const Outlet = require('../models/outlet');

module.exports.addOutlet = (req,res) => {
    const outlet = new Outlet({
        outletName: req.body.outletName,
        address: req.body.address,
        
    })
}