const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: {
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
        type: String
    },
    authMethod: {
        type: String,
    },
    verification: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: Number
    },
    cart: {
        outlet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet'
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                variant: {
                    type: String,
                    default: "default"
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    userProfilePic: {
        url: {
            type: String,
            default: "null"
        },
        id: {
            type: String,
            default: "null"
        }
    },
    coupons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon'
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);