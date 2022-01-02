'use strict';

const _     = require('lodash'),
    modules = [
        'tenant.routes'
    ];

function init(app) {
    let core  = {};
    _.each(modules, (module) => {
        
        core[module] = require('./' + module)(app);
    });

    return core;
}

module.exports = init;