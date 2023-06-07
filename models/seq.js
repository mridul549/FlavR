const mongoose = require('mongoose');

const SeqSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    outlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    counter: {
        type: Number,
        default: 0
    }    
})

module.exports = mongoose.model('Seq', SeqSchema);