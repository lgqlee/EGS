var core_loader = require('./core_loader');

module.exports.parse = function (app_name, route_str, callback_str) {
    var callback = core_loader.function_load(
        app_name,
        core_loader.config['sys']['app_controllers_dir'],
        callback_str
    );
    var route_arr = route_str.split(' ');
    return {
        method: route_arr[0].toLowerCase(),
        url: route_arr[1],
        callback: callback
    };
};