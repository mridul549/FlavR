const { default: mongoose, model } = require('mongoose');
const Seq = require('../models/seq')

module.exports.newSeq = (req,res) => {
    const outletid = req.body.outletid

    const seq = new Seq({
        _id: new mongoose.Types.ObjectId(),
        counter: 0,
        outlet: outletid
    })
    seq.save()
    .then(result => {
        return res.status(201).json({
            message: "New sequence initiated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.resetSeq = (req,res) => {
    const outletid = req.body.outletid

    Seq.updateOne({ outlet: outletid }, {
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

module.exports.nano = async (req,res) => {
    const { customAlphabet } = await import('nanoid');
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 10);
    const nano = nanoid()
    return res.status(200).json({
        nano: nano
    })
}