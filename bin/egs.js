#!/usr/bin/env node

var program = require('commander');
var version = require('../package')['version'];
var core_loader = require('../lib/core_loader');
var task_parse = require('../lib/task_parse').parse;
var apps = core_loader.apps;
var config_load = core_loader.config.load;


program.version(version).parse(process.argv);

var func_args = program.args.splice(1),
    func_name = program.args[0];

switch (func_name) {
    case 'init':
        var cur_apps = func_args.length ? func_args : apps;
        cur_apps.forEach(function (app) {
            config_load(app, 'tasks')['init'].forEach(function (task_str) {
                task_parse(app, task_str)();
            });
        });
        break;
    case 'timer':
        var cur_apps = func_args.length ? func_args : apps;
        cur_apps.forEach(function (app) {
            config_load(app, 'tasks')['timer'].forEach(function (task_str) {
                task_parse(app, task_str)();
            });
        });
        break;
    case 'persist':
        //TODO: Redis Persist
        break;
    case undefined:
        console.log('Welcome to EGS world.');
        break;
    default :
        console.log('param "' + func_name + '" not accepted!')
}