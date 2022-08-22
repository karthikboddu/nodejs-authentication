'use strict';

const _     = require('lodash'),
    modules = [
        'init_mongodb',
        'init_redis'
    ];

function init(cfg) {

    let core  = {},
        db    = {
            ...cfg.db,
            'redis': cfg.db.redis,
            'mongo': cfg.db.mongo
        };
        //console.log(modules)
    _.each(modules, (module) => {
        
        core[module] = require('./' + module)(cfg, db);
    });

    return core;
}

module.exports = init;