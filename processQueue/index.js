const Queue = require('bull')
const path  = require('path')
const { REDIS_PORT, REDIS_URI } = require('../config/redis')

const orderQueue = new Queue('orderQueue', {
    redis: {
        port: REDIS_PORT,
        host: REDIS_URI
    }
})

orderQueue.process(path.join(__dirname, 'orderQueueProcess.js'))