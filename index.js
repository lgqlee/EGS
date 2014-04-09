var controller_parse = require('./lib/controller_parse').parse;
var core_loader = require('./lib/core_loader');
var express = require('express');
var http = require('http');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.compress());
app.use(express.methodOverride());
app.use(app.router);


module.exports.start = function (callback) {
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
    http.createServer(app).listen(app.get('port'), function () {
        callback.apply(app);
    })
};