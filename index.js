var controller_parse = require('./lib/controller_parse').parse;
var core_loader = require('./lib/core_loader');
var express = require('express');
var Model = require('./lib/active_record/model');
var Queue = require('./lib/active_record/queue');
var Singleton = require('./lib/active_record/singleton');
var db_pool = require('./lib/active_record/db_pool');
var bodyParser = require('body-parser');
var getTask = require('./lib/task_parse').getTask;

// 项目初始化
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(bodyParser());
app.use(function (req, res, next) {
    if (app.get('env') == 'development') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Powered-by', 'EGame');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('charset', 'utf-8');
    next();
});

module.exports = {
    Model: Model,
    Queue: Queue,
    Singleton: Singleton,
    db_pool: db_pool
};

module.exports.start = function (fn) {
    // 载入全局的路由
    core_loader.apps.forEach(function (app_name) {
        var app_routes = core_loader.config.load(
                app_name, 'routes'),
            route, route_obj;
        for (route in app_routes['routes']) {
            if (app_routes['routes'].hasOwnProperty(route)) {
                route_obj = controller_parse(app_name,
                    app_routes['namespace'],
                    route,
                    app_routes['routes'][route]
                );
                app[route_obj.method](route_obj.url, route_obj.fn);
            }
        }
        // TODO 添加定时任务接口
        app.get('/sys/task', function (req, res) {
            var app_name = req.param('app');
            var task_name = req.param('task');
            var fn;
            try {
                fn = (getTask(app_name, task_name));
                fn(function () {
                    res.send('ok');
                })
            } catch (_) {
                res.send('fail');
            }
        });
    });

    // Http 服务启动，并将 fn 上下文更换至 app
    app.listen(app.get('port'));
    fn.apply(app);
};
