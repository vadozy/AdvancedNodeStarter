const mongoose = require('mongoose');

const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://localhost:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

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
    const cachedValue = await client.get(key);
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
    client.set(key, JSON.stringify(result), 'EX', 10); // cache expires in 10 seconds.

    return result;
}

// Call to use cache for a given Query.
mongoose.Query.prototype.cache = function() {
    this._useCache = true;
    return this;
}
