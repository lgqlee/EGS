var sys_root_config = require('../../config/sys');
var app_root = require('./root_explore').root_path;
var path = require('path');

var database_config = require(path.join(
        app_root, sys_root_config['apps_config_dir'] + '/database')
)[process.env['NODE_ENV'] || 'development'];


var valid_params = [
    'global_route_namespace',
    'redis_persist_key'
];

try {
    // Merge sys and user config.
    var app_sys_config = require(path.join(
            app_root, sys_root_config['apps_config_dir'] + '/sys')
    );
    valid_params.forEach(function (param) {
        if (app_sys_config[param]) {
            sys_root_config[param] = app_sys_config[param];
        }
    });
} catch (_) {
    // DO nothing here.
}

module.exports = {
    database: database_config,
    sys: sys_root_config,
    // TODO: load config from app.
    load: function (app_name, config_name) {
        try {
            return require(path.join(
                    app_root, [
                        sys_root_config['apps_dir'],
                        app_name,
                        sys_root_config['app_config_dir'],
                        config_name
                    ].join('/')
                )
            );
        } catch (_) {
            return {};
        }
    }
};