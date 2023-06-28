const mongoose = require('mongoose');

const categoryIconSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    icon: {
        url: {
            type: String,
            required: true
        },
        iconid: {
            type: String,
            required: true
        }
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('CategoryIcon', categoryIconSchema);