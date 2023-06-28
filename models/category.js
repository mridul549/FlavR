const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    icon: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'CategoryIcon'
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Outlet'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Category', categorySchema);