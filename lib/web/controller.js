var express = require('express');
var controller_parse = require('./controller_parse').parse;
var core_loader = require('../core_loader');

var router = express.Router();

var loadApp = function (app_name) {
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
            router[route_obj.method](route_obj.url, function (req, res, next) {
                var fn = route_obj.fn;
                switch (fn.length) {
                    case 2:
                        fn(req, res, app_name);
                        break;
                    case 3:
                        fn(req, res, next, app_name);
                        break;
                    default :
                        throw 'Arguments length can only be 2 or 3!';
                }
            });
        }
    }
};

var removeApp = function (app_name) {
    // TODO
};

core_loader.apps.forEach(function (app_name) {
    loadApp(app_name);
});

module.exports = {
    router: router,
    loadApp: loadApp,
    removeApp: removeApp
};
