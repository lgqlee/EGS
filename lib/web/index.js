var express = require('express');
var bodyParser = require('body-parser');
var system = require('./system');
var controller = require('./controller');

var global_route_namespace = require('../core_loader').config['sys']['global_route_namespace'];

var appInit = function () {
    // 项目初始化
    var app = express();
    // all environments
    app.set('port', process.env.PORT || 3000);
    app.disable('x-powered-by');
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(function (req, res, next) {
        if (app.get('env') === 'development') {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Powered-by', 'EGame');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('charset', 'utf-8');
        next();
    });
    return app;
};

var launch = function (fn) {
    var app = appInit();
    // 注册系统接口
    app.use('/sys', system.router);
    // 注册业务接口
    app.use('/' + global_route_namespace, controller.router);
    // Http 服务启动，并将 fn 上下文更换至 app
    app.listen(app.get('port'));
    fn && fn.apply(app);
};

module.exports = {
    launch: launch,
    loadApp: controller.loadApp,
    removeApp: controller.removeApp
};