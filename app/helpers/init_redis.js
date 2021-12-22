const redis = require("redis");

const redisCli = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

redisCli.on("connect", function () {
    console.log("Redis plugged in.");
  });

module.exports = redisCli
