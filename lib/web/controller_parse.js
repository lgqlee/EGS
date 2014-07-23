var core_loader = require('./../core_loader/index');

module.exports.parse = function (app_name, app_namespace, route_str, fn_str) {
    var fn = core_loader.function_load(
        app_name,
        core_loader.config['sys']['app_controllers_dir'],
        fn_str
    );
    // 引入全局以及app自定义命名空间
    var route_arr = route_str.split(' '),
        url_prefix = [''];
    if (app_namespace) {
        url_prefix.push(app_namespace);
    }
    return {
        method: route_arr[0].toLowerCase(),
        url: url_prefix.join('/') + route_arr[1],
        fn: fn
    };
};