const Queue = require('bull')
const path  = require('path')
const redis = require('redis');

const client = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-10818.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port: 10818
    }
});

client.connect();

// Event listener for Redis 
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

orderQueue.process(path.join(__dirname, 'orderQueueProcess.js'))

orderQueue.on('completed', (job) => {
    console.log(`Completed #${job.id} Job`);
})