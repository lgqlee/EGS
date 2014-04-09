var root_explore = require('./root_explore');

module.exports = {
    config: require('./config_loader'),
    function_load: require('./function_loader').load,
    root_path: root_explore.root_path,
    apps: root_explore.apps
};