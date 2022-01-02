const redis = require("redis");


"use strict";


module.exports = (cfg, data) => {

  const redisCli = redis.createClient({
    port: cfg.db.redis.port,
    host: cfg.db.redis.host
  });

  if (process.env.REDIS_ON == "ON") {
    redisCli.on("connect", function () {
      console.log("Redis plugged in.");
    });
  } else {
    console.log("Redis is OFF.");
  }


  return redisCli;
}

