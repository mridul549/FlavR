const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    validity: {
        from: {
            type: Date,
            default: Date.now
        },
        until: {
            type: Date,
            required: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Outlet'
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Coupon', couponSchema);