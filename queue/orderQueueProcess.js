const { default: mongoose, model } = require('mongoose');
const Order    = require('../models/order')
const Seq      = require('../models/seq')
const firebase   = require('../config/firebase')
const orderfb    = firebase.collection('Order')

mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING)

const orderQueueProcess = async (job, done) => {
    const orderid = job.data.orderid
    const outletid = job.data.outletid

    Seq.findOneAndUpdate({ outlet: outletid }, { $inc: { "counter": 1 } }, { new: true })
    .exec()
    .then(async result => {
        let orderNum = result.counter
 
        await Order.updateOne({ _id: orderid }, { 
            $set: { 
                orderNumber: orderNum, 
            }
        })
        .exec()

        const orderRef = orderfb.where('orderid', '==', orderid)
        const snapshot = await orderRef.get();
        if (snapshot.empty) {
            console.log("No matching document found.");
        } else {
            snapshot.forEach((doc) => {
                doc.ref.update({ orderNumber: orderNum });
            });
        }
        return result
    })
    .then(result => {
        done()
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = orderQueueProcess
