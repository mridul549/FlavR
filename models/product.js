const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: {
        name: {
            type: String,
            required: true
        },
        icon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CategoryIcon',
            required: true
        }
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
    veg: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    productImage: {
        url: {
            type: String,
        },
        imageid: {
            type: String,
        }
    },
    variants: [
        {
            variantName: {
                type: String
            },
            price: {
                type: Number
            }
        }
    ], 
    inStock: {
        type: Boolean,
        default: true
    },
    stockCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);