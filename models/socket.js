const mongoose = require('mongoose');

const socketSchema = mongoose.Schema({
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
})

module.exports = mongoose.model('Socket', socketSchema);