var core_loader = require('./lib/core_loader');
var Model = require('./lib/active_record/model');
var Queue = require('./lib/active_record/queue');
var Singleton = require('./lib/active_record/singleton');
var db_pool = require('./lib/active_record/db_pool');
var web = require('./lib/web');

module.exports = {
    Model: Model,
    Queue: Queue,
    Singleton: Singleton,
    db_pool: db_pool,
    require: function (pkg_name) {
        return require(core_loader.root_path + '/vendor/' + pkg_name);
    },
    launch: web.launch,
    model: function (name) {
        var caller = module.exports.model.caller;
        return core_loader.module_load(caller.arguments[caller.arguments.length - 1], name);
    },
    config: function (name) {
        var caller = module.exports.config.caller;
        return core_loader.config.load(caller.arguments[caller.arguments.length - 1], name);
    }
};

global.EGS = module.exports;

