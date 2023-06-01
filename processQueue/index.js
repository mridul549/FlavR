const Queue = require('bull')
const path  = require('path')
const { REDIS_PORT, REDIS_URI, REDIS_PASSWORD, REDIS_HOST } = require('../config/redis')
const { Connect } = require("taskforce-connector");
const redis = require('redis');

const client = redis.createClient({
    url: process.env.URI,
});

client.connect();

// Event listener for Redis errors
client.on('connect', () => {
    console.log('Connected to Redis Cloud');
});
  
client.on('error', (err) => {
    console.error('Redis Error:', err);
});

const orderQueue = new Queue('orderQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

// const taskforceConnection = Connect("My order queue", "d616d7b9-578b-4813-93cd-36090ae74483", {
//     host: REDIS_URI,
//     port: REDIS_PORT,
// });

orderQueue.process(path.join(__dirname, 'orderQueueProcess.js'))

orderQueue.on('completed', (job) => {
    console.log(`Completed #${job.id} Job`);
})