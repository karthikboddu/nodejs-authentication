const redis = require("redis");

const redisCli = redis.createClient({
  url: REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

redisCli.on("connect", function () {
    console.log("Redis plugged in.");
  });

module.exports = redisCli
