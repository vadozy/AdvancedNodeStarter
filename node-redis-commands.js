// run these commands from node repl to confirm redis runs on localhost
const redis = require('redis');
const redisUrl = 'redis://localhost:6379';
const client = redis.createClient(redisUrl);

client.set('hi', 'there');
client.get('hi', (err, val) => console.log(val));
client.get('hi', console.log);

client.hset('german', 'red', 'rot');
client.hget('german', 'red', console.log);
client.hset('german', 'blue', 'blau');
client.hget('german', 'blue', console.log);

// delete all redis data
client.flushall();

// redis timeout: expire in 5 seconds
client.set('color', 'red', 'EX', 5);
client.get('color', console.log);
