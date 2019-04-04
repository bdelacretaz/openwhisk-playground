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
                if (options.total_retry_time > 5 * 1000) {
                    throw 'Redis retry time exhausted'
                }
                if (options.attempt > 10) {
                    throw 'Redis max attempts exhausted'
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

    async put(data, expirationSeconds) {
        const client = this.client
        return new Promise(async function (resolve, reject) {
            client.incr(ID_KEY, function(err, key) {
                console.log(`Saving continuation ${key}, expires in ${expirationSeconds} seconds`)
                data._CONTINUATION = key
                client.setex(key, expirationSeconds, JSON.stringify(data))
                resolve(key)
            });
        })
    }
    
    async get(key, callback) {
        const client = this.client
        return new Promise(async function (resolve, reject) {
            client.get(key, (err, data) => { 
                if(err) {
                    reject(err)
                } else {
                    resolve({key : key, data:JSON.parse(data)})
                }
            })
        })
    }
} 

module.exports = StateStore