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

module.exports.resetSeq = (req,res) => {
    Seq.updateOne({ key: "Counter_key"}, {
        $set: { counter: 0 }
    })
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "Order numbers reset successfully"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}