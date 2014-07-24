var core_loader = require('./lib/core_loader');
var path_loader = require('./lib/core_loader/path_loader');
var Model = require('./lib/active_record/model');
var Queue = require('./lib/active_record/queue');
var Singleton = require('./lib/active_record/singleton');
var db_pool = require('./lib/active_record/db_pool');
var web = require('./lib/web');

var getCallerPath = function () {
    try {
        var err = new Error();
        var caller_file;
        var current_file;
        Error.prepareStackTrace = function (err, stack) {
            return stack;
        };
        current_file = err.stack.shift().getFileName();
        while (err.stack.length) {
            caller_file = err.stack.shift().getFileName();
            if (current_file !== caller_file) return caller_file;
        }
    } catch (_) {

    }
    throw 'Can not find caller path!';
};

module.exports = {
    Model: Model,
    Queue: Queue,
    Singleton: Singleton,
    db_pool: db_pool,
    vendor: function (pkg_name) {
        return require(core_loader.root_path + '/vendor/' + pkg_name);
    },
    launch: web.launch,
    model: function (name) {
        return path_loader.loadFromFile(getCallerPath(), 'models', name);
    },
    config: function (name) {
        return path_loader.loadFromFile(getCallerPath(), 'config', name);
    }
};

global.EgServer = module.exports;
global.model = EgServer.model;
global.vendor = EgServer.vendor;
global.config = EgServer.config;