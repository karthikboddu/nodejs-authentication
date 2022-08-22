'use strict';

const _     = require('lodash'),
    modules = [
        'auth.routes',
        'user.routes',
        'tutorial.routes',
        'tenant'
    ];

function init(app) {
    let core  = {};
    _.each(modules, (module) => {
        
        core[module] = require('./' + module)(app);
    });

    return core;
}

module.exports = init;