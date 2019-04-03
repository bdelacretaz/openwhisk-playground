'use strict'

const REDIS = require('redis')
const PREFIX = "c_"
const ID_KEY = "c_ID"

class StateStore {
    constructor (options = {}) {
        this.options = options ? options : {}
        if(!options.host) {
            options.host = 'localhost'
        }
        if(!options.port) {
            options.port = 6379
        }
        console.log(`Connecting to Redis: ${options.host}:${options.port}`)
            
        this.client = REDIS.createClient({
            host: options.host,
            port: options.port,
            retry_strategy: function (options) {
                if (options.total_retry_time > 2 * 1000) {
                    return _mkError('Redis retry time exhausted');
                }
                if (options.attempt > 10) {
                    return _mkError('Redis max attempts exhausted');
                }
                // reconnect after semi-random time
                return Math.min(options.attempt * 100, 3000);
                }
            }            
        )
    }
    
    async close() {
      this.client.quit()
    }

    async put(data, expirationSeconds, callback) {
        const redis = this.client
        redis.incr(ID_KEY, function(err, key) {
            console.log(`Saving continuation ${key}, expires in ${expirationSeconds} seconds`)
            data._CONTINUATION = key
            redis.setex(key, expirationSeconds, JSON.stringify(data))
            callback(key)
        });
    }
    
    async get(key, callback) {
        this.client.get(key, (err, data) => { callback(err, JSON.parse(data)) })
    }
    
    _mkError(msg) {
        console.log(msg);
        return new Error(msg);          
    }
} 

module.exports = StateStore