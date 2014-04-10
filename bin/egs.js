#!/usr/bin/env node

// 全局命令行，直接在EGS项目或者项目子目录中调用（会根据package.json中的依赖关系定位根目录），如果
// 定位失败会直接抛出异常
// 调用命令 egs function [args]
// 其中 function 支持的参数有 init[针对app的初始化执行] timer[针对app的定时任务]

var program = require('commander');
var version = require('../package')['version'];
var core_loader = require('../lib/core_loader');
var task_parse = require('../lib/task_parse').parse;
var apps = core_loader.apps;
var config_load = core_loader.config.load;

program.version(version).parse(process.argv);

var func_args = program.args.splice(1),
    func_name = program.args[0],
    cur_apps;

switch (func_name) {
    case 'init':
        // 根据 args 来决定调用的 apps，如果为空则调用全部 apps 的初始化任务。
        cur_apps = func_args.length ? func_args : apps;
        cur_apps.forEach(function (app) {
            config_load(app, 'tasks')['init'].forEach(function (task_str) {
                task_parse(app, task_str)();
            });
        });
        break;
    case 'timer':
        cur_apps = func_args.length ? func_args : apps;
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
        // Hello World
        console.log('Welcome to EGS world.');
        break;
    default :
        console.log('param "' + func_name + '" not accepted!')
}