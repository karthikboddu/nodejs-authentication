const redis = require("redis");

const redisCli = redis.createClient({
    port:20230,
    host:"ec2-52-203-53-204.compute-1.amazonaws.com"
});

redisCli.on("connect", function () {
    console.log("Redis plugged in.");
  });

module.exports = redisCli
