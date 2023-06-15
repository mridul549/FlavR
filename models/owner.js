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
    authMethod: {
        type: String,

    },
    mobile: {
        type: Number
    },
    outlets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
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
        url: {
            type: String,
            default: "null"
        },
        id: {
            type: String,
            default: "null"
        }
    },
    role: {
        type: String,
        default: "Owner"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Owner', ownerSchema);