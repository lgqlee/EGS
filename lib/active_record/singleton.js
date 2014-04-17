var Model = require('./model');

var Singleton = function () {
    this.init.apply(this, arguments);
};

var fn = Singleton.prototype;

Singleton.create = function (name, fields, fn) {
    return new Singleton(name, fields, fn)
};

// 单例模式下默认 Key 为name，并且默认 redis only mode。
fn.init = function (name, fields, fn) {
    fields['id'] = 'String:' + name;
    var SingleModel = Model.extend('single', fields, {
        redis_only: true
    });
    SingleModel.find(name, function (singleton) {
        if (singleton) {
            return fn(singleton);
        }
        SingleModel.create({}, function (err, obj) {
            return fn(obj);
        });
    });
};

module.exports = Singleton;