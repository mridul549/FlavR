const Queue = require('bull')
const path  = require('path')
const { REDIS_PORT, REDIS_URI } = require('../config/redis')
const { Connect } = require("taskforce-connector");

const orderQueue = new Queue('orderQueue', {
    redis: {
        port: REDIS_PORT,
        host: REDIS_URI
    }
})

const taskforceConnection = Connect("My order queue", "d616d7b9-578b-4813-93cd-36090ae74483", {
    host: REDIS_URI,
    port: REDIS_PORT,
});

orderQueue.process(path.join(__dirname, 'orderQueueProcess.js'))

orderQueue.on('completed', (job) => {
    console.log(`Completed #${job.id} Job`);
})