const { default: mongoose, model } = require('mongoose');
const Seq = require('../models/seq')

module.exports.newSeq = (req,res) => {
    const seq = new Seq({
        _id: new mongoose.Types.ObjectId(),
        counter: 0,
        key: "Counter_key"
    })
    seq.save()
    .then(result => {
        return res.status(200).json({
            message: "New sequence initiated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(200).json({
            error: err
        })
    })
}