// Minimal Redis caching example with OpenWhisk
// Inspired from https://medium.com/tech-tajawal/introduction-to-caching-redis-node-js-e477eb969eab
const fetch = require("node-fetch");
const redis = require('redis')
const dataURL = 'https://jsonplaceholder.typicode.com/users?id=6';
 
function mkError(msg) {
    console.log(msg);
    return new Error(msg);        
}

function main (params) {
 
    params = params ? params : {}
    var host = params.host ? params.host : "localhost";
    var port = params.port ? params.port : 6379;
    
    // create and connect redis client to local instance.
    console.log(`Connecting to Redis host ${host} port ${port}`);
    const client = redis.createClient({
        host:host, 
        port: port,
        retry_strategy: function (options) {
         if (options.total_retry_time > 2 * 1000) {
             return mkError('Redis retry time exhausted');
         }
         if (options.attempt > 10) {
             return mkError('Redis max attempts exhausted');
         }
         // reconnect after semi-random time
         return Math.min(options.attempt * 100, 3000);
        }
    });
    
    // echo redis errors to the console
    client.on('error', (err) => {
        console.log("Error " + err)
    });

    var startTime = new Date();

    // key to store results in Redis store
    const usersRedisKey = 'user:users';
    const redisInfo = { host:host, port:port, key:usersRedisKey};
 
    return new Promise(function (resolve, reject) {
        // Cached data in Redis?
        client.get(usersRedisKey, (err, users) => {
            
            if(err) {
                console.log(`Redis error ${err}`);
                return resolve({ statusCode:500, body: err.toString(), headers:{ 'Content-Type': 'text/plain'}}) 
                
            } else if (users) {
                var elapsed = new Date() - startTime;
                client.quit();
                result = { data : JSON.parse(users), source: 'cache', elapsedMsec: elapsed, redis: redisInfo }
                console.log(`${usersRedisKey} found in cache, ${elapsed} msec`)
                return resolve({ body : result })
 
            } else {
                console.log(`${usersRedisKey} not found in cache, getting data from ${dataURL}`)
                // Fetch from the data URL
                fetch(dataURL)
                    .then(console.log(`Got data from ${dataURL}`))
                    .then(response => response.json())
                    .then(users => {

                        // Save the  API response in Redis with an expiration time
                        var validitySeconds = 10;
                        console.log(`Saving to Redis cache, validity=${validitySeconds} seconds...`);
                        client.setex(usersRedisKey, validitySeconds, JSON.stringify(users))
                        console.log(`Saved.`);

                        var elapsed = new Date() - startTime;
                        client.quit();
                        result = { data : users, source: 'web', elapsedMsec: elapsed, redis: redisInfo }
                        return resolve({ body : result })
                    })
                    .catch(error => {
                        console.log(error)
                        return resolve({ statusCode:500, body: error.toString(), headers:{ 'Content-Type': 'text/plain'}}) 
                    })
            }
        })
    })
}
 
// This is for command-line testing
// like node -e 'require("./continuations.js").main({host:"localhost", port:6379})'
module.exports.main = main