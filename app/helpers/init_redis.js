const redis = require("redis");

const redisCli = redis.createClient({
    port:6379,
    host:"127.0.0.1"
});

redisCli.on("connect", function () {
    console.log("Redis plugged in.");
  });

module.exports = redisCli
