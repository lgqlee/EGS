var Model = require('./model');

var Singleton = function () {
    this.init.apply(this, arguments);
};

var fn = Singleton.prototype;

fn.init = function (name, fields, fn) {
    var SingleModel = Model.extend('single', fields, {
        redis_only: true
    });
    SingleModel.find(name, function (singleton) {
        if (singleton) {
            return fn(singleton);
        }
        SingleModel.create({}, function (obj) {
            return fn(obj);
        });
    });
};
