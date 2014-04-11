var controller_parse = require('./lib/controller_parse').parse;
var core_loader = require('./lib/core_loader');
var express = require('express');

// 项目初始化
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(function(req, res, next){
    res.setHeader('Powered-by', 'EGame');
    next();
});

module.exports.start = function (callback) {
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
                app[route_obj.method](route_obj.url, route_obj.callback);
            }
        }
    });
    // Http 服务启动，并将callback上下文更换至 app
    app.listen(app.get('port'));
    callback.apply(app);
};