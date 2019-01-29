const mongoose = require('mongoose');

const redis = require('redis');
const util = require('util');

const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {

    //console.log("I'M ABOUT TO RUN A QUERY");

    if (!this._useCache) {
        return exec.apply(this, arguments);
    }
    
    const key = JSON.stringify({ 
        query: {...this.getQuery()}, 
        collection: this.mongooseCollection.name 
    });
    //console.log("key: ", key);

    // Check redis cache
    const cachedValue = await client.hget(this._hashKey, key);
    if (cachedValue) {
      //console.log('SERVING FROM CACHE', cachedValue);
      const cachedObject = JSON.parse(cachedValue);

      return cachedObject instanceof Array
        ? cachedObject.map(el => (new this.model(el)))
        : new this.model(cachedObject);
    }

    //console.log('SERVING FROM MONGODB');
    const result = await exec.apply(this, arguments);
    //console.log("result -> ", result);
    client.hset(this._hashKey, key, JSON.stringify(result)); // ('EX', 10) -> not supported for hset 

    return result;
}

// Call to use cache for a given Query.
mongoose.Query.prototype.cache = function(options = {}) {
    this._useCache = true;
    this._hashKey = JSON.stringify(options.key || ''); // empty string is default
    return this;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};
