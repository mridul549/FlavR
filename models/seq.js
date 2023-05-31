const mongoose = require('mongoose');

const SeqSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    key: {
        type: String,
        default: "Counter_key"
    },
    counter: {
        type: Number,
        default: 0
    }    
})

module.exports = mongoose.model('Seq', SeqSchema);