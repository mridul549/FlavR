const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    orderNumber: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    products: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        variant: {
            type: String,
        },
        quantity: {
            type: Number
        },
        readyToDeliver: {
            type: Boolean,
            default: false
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalQuantity: {
        type: Number,
        default: 0
    },
    payment: {
        type: Boolean,
        default: false
    },
    instructions: {
        packOrder: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: "No special instructions"
        }
    },
    status: {
        type: String,
        default: "PROCESSING"
    },
    coupon: {
        type: String,
        ref: 'Coupon'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);