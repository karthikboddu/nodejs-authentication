'use strict';

const _     = require('lodash'),
    modules = [
        'tenant.service',
        'building.service'
    ];

function init(cfg) {
    console.log(cfg,"cfg")
    let core  = {};
    _.each(modules, (module) => {
        
        core[module] = require('./' + module)(cfg);
    });

    return core;
}

module.exports = init;