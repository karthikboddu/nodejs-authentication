const winston = require('winston');
const { combine, timestamp, printf, colorize, align, json } = winston.format;



const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.File({
            filename: '/tmp/tenant/logs/tenant-api/api-log.logs',
        }),
    ],
});

module.exports =  {
    logger
}



