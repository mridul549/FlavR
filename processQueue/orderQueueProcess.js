const { default: mongoose, model } = require('mongoose');
const Order    = require('../models/order')
const Seq      = require('../models/seq')

mongoose.connect("mongodb+srv://mridul549:xTKgkDyitxpKcOY7@cluster0.iuoe1mb.mongodb.net/?retryWrites=true&w=majority")

const orderQueueProcess = async (job, done) => {
    const orderid = job.data.orderid

    Seq.findOneAndUpdate({ id: "autoval" }, { $inc: {"seq": 1 } }, { new: true })

    done()
}
module.exports = orderQueueProcess


/*
    OrderSeq.findOneAndUpdate({ id: "autoval" }, { $inc: {"seq": 1 } }, { new: true })
    .exec()
    .then(result => {
        let seqID;
        if(result==null) {
            const newVal = new OrderSeq({
                id: "autoval", 
                seq: 1
            })
            seqID=1
            newVal.save()
        } else {
            seqID=result.seq
        }
        const order = new TestOrder({
            id: seqID,
            name: req.body.name
        })
        order.save()
        .then(result => {
            return res.status(201).json({
                result
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

*/