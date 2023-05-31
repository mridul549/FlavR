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
        quantity: {
            type: Number
        }
    }],
    totalPrice: {
        type: mongoose.SchemaTypes.Decimal128,
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
        type: String
    },
    status: {
        type: String,
        default: "processing"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);