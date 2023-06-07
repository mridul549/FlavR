const { default: mongoose, model } = require('mongoose');
const Order    = require('../models/order')
const Seq      = require('../models/seq')

mongoose.connect("mongodb+srv://mridul549:xTKgkDyitxpKcOY7@cluster0.iuoe1mb.mongodb.net/?retryWrites=true&w=majority")

const orderQueueProcess = async (job, done) => {
    const orderid = job.data.orderid

    Seq.findOneAndUpdate({ key: "Counter_key" }, { $inc: { "counter": 1 } }, { new: true })
    .exec()
    .then(async result => {
        let orderNum = result.counter

        await Order.updateOne({ _id: orderid }, { 
            $set: { 
                orderNumber: orderNum, 
                status: "preparing"
            }
        })
        .exec()
        return result
    })
    .then(result => {
        done()
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports = orderQueueProcess
