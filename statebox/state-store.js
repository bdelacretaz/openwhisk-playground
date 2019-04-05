/* eslint-disable no-console */
const REDIS = require('redis');
const uuidv4 = require('uuid/v4');

class StateStore {
  constructor(inputOptions = {}) {
    this.options = inputOptions;
    if (!this.options.host) {
      this.options.host = 'localhost';
    }
    if (!this.options.port) {
      this.options.port = 6379;
    }
    console.log(`Connecting to Redis: ${this.options.host}:${this.options.port}`);

    this.client = REDIS.createClient({
      host: this.options.host,
      port: this.options.port,
      retry_strategy: (options) => {
        if (options.total_retry_time > 5 * 1000) {
          throw new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          throw new Error('Redis max attempts exhausted');
        }
        // reconnect after semi-random time
        return Math.min(options.attempt * 100, 3000);
      },
    });
  }

  async close() {
    this.client.quit();
  }

  async put(inputData, expirationSeconds) {
    console.log('StateStore.put()');
    const { client } = this;
    const key = uuidv4();
    const data = inputData;
    return new Promise(async (resolve) => {
      data.CONTINUATION = key;
      client.setex(key, expirationSeconds, JSON.stringify(data));
      console.log(`Saved continuation ${key}, expires in ${expirationSeconds} seconds`);
      resolve(key);
    });
  }

  async get(key) {
    console.log(`StateStore.get(${key})`);
    const { client } = this;
    return new Promise(async (resolve, reject) => {
      client.get(key, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ key, data: JSON.parse(data) });
        }
      });
    });
  }
}

module.exports = StateStore;
