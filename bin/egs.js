#!/usr/bin/env node

// 全局命令行，直接在EGS项目或者项目子目录中调用（会根据package.json中的依赖关系定位根目录），如果
// 定位失败会直接抛出异常
// 调用命令 egs function [args]
// 其中 function 支持的参数有 init[针对app的初始化执行] timer[针对app的定时任务]

var program = require('commander');
var version = require('../package')['version'];
program.version(version).parse(process.argv);
var scaffold = require('./scaffold');
var npm = require('npm');

var func_args = program.args.splice(1),
    func_name = program.args[0],
    cur_apps;

// 如果是初始化当前文件夹
if (func_name === 'create') {
    scaffold.create(func_args[1] || 'egs_app');
    return;
}

var core_loader = require('../lib/core_loader');
var task_parse = require('../lib/task_parse').parse;
var apps = core_loader.apps;
var config_load = core_loader.config.load;

switch (func_name) {
    case 'generate':
        func_args.forEach(function (app) {
            scaffold.generate(core_loader.root_path, app);
        });
        break;
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
    case 'start':

    case 'install':
        // 根据 args 来决定安装依赖的 apps，如果为空则调用全部 apps。
        cur_apps = func_args.length ? func_args : apps;
        npm.load({}, function (err) {
            if (err) throw Error(err);
            npm.on("log", function (message) {
                if (arg) console.log(message)
            });
            cur_apps.forEach(function (app) {
                var requirements = config_load(app, 'requirements');
                npm.commands.install(requirements, function (err) {
                    if (err) throw Error(err);
                });
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