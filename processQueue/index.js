const Queue = require('bull')
const path  = require('path')
const { REDIS_PORT, REDIS_URI, REDIS_PASSWORD } = require('../config/redis')
const { Connect } = require("taskforce-connector");
const redis = require('redis');

const client = redis.createClient({
    password: 'zvrM2aS77e1WPps4D4gO6u4cIB1L5Jmo',
    socket: {
        host: 'redis-10818.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port: 10818
    }
});

client.on('connect', () => {
    console.log('Connected to Redis Cloud');
});
  
// Event listener for Redis errors
client.on('error', (err) => {
    console.error('Redis Error:', err);
});
  

const orderQueue = new Queue('orderQueue', {
    redis: {
        port: REDIS_PORT,
        host: REDIS_URI,
        password: REDIS_PASSWORD
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