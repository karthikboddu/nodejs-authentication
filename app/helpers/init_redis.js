const redis = require("redis");


"use strict";


module.exports = (cfg, data) => {
  if (process.env.REDIS_ON == "ON") {
    
    const redisCli = redis.createClient({
      port: cfg.db.redis.port,
      no_ready_check: true,
      host: cfg.db.redis.host
    });

    redisCli.on("connect", function () {
      console.log("Redis plugged in.");
    });
    return redisCli;
  } else {
    console.log("Redis is OFF.");
  }


  
}

