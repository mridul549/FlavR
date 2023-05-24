const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    password: {
        type: String,
        required: true
    },
    outlets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            outlet: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Outlet'
            }
        }
    ],
    ownerProfilePic: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Owner', ownerSchema);