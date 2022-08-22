'use strict';

const _     = require('lodash'),
    modules = [
        'auth.service',
        'tenant'
    ];

function init(cfg) {
    let core  = {};
    _.each(modules, (module) => {
        
        core[module] = require('./' + module)(cfg);
    });

    return core;
}

module.exports = init;