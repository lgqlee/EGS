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
            router[route_obj.method](route_obj.url, route_obj.fn);
        }
    }
};

var removeApp = function (app_name) {
    // TODO
};

module.exports = {
    router: router,
    loadApp: loadApp,
    removeApp: removeApp
};
