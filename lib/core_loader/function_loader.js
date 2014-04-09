var sys_root_config = require('../../config/sys');
var app_root = require('./root_explore').root_path;
var path = require('path');

module.exports = {
    load: function (app_name, type, selector) {
        var sle_arr = selector.split('#'),
            func_name = sle_arr[1],
            module_name = type === sys_root_config['app_controllers_dir'] ?
                sle_arr[0] + '_controller' : sle_arr[0];
        return require(path.join(app_root, [
            sys_root_config['apps_dir'],
            app_name,
            type,
            module_name
        ].join('/')))[func_name]
    }
};