const redis = require("redis");

const redisCli = redis.createClient({
    port:20229,
    host:"p7e45383a68e81a1c10f95227c419c81ff8615c59c8b235f858ea965aac28a096@ec2-52-203-53-204.compute-1.amazonaws.com"
});

redisCli.on("connect", function () {
    console.log("Redis plugged in.");
  });

module.exports = redisCli
