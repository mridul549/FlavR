const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    productImage: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);