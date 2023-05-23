const mongoose = require('mongoose');

const outletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    outletName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    menu: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    outletImage: {
        type: String
    }
})

module.exports = mongoose.model('Outlet', outletSchema);