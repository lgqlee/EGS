var root_explore = require('./root_explore');
var config = require('./config_loader');
var function_load = require('./function_loader').load;
var path = require('path');

module.exports = {
    config: config,
    function_load: function_load,
    module_load: function (app, name) {
        return require(path.join(root_explore.root_path, [
            config.sys['apps_dir'],
            app,
            'models',
            name
        ].join('/')))
    },
    // EGS 项目的根目录
    root_path: root_explore.root_path,
    // 项目中所有 app 的列表
    apps: root_explore.apps
};