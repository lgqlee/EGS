var root_explore = require('./root_explore');

module.exports = {
    config: require('./config_loader'),
    function_load: require('./function_loader').load,
    // EGS 项目的根目录
    root_path: root_explore.root_path,
    // 项目中所有 app 的列表
    apps: root_explore.apps
};