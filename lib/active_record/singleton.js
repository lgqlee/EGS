var Model = require('./model');

var Singleton = function () {
    this.init.apply(this, arguments);
};

var fn = Singleton.prototype;

Singleton.extend = function (name, fields) {
    return new Singleton(name, fields);
};

// 单例模式下默认 Key 为name，并且默认 redis only mode。
fn.init = function (name, fields) {
    fields['id'] = 'String:' + name;
    this._id = name;
    this._super = Model.extend('single', fields, {
        redis_only: true
    });
    return this._super;
};

fn.get = function (fn) {
    var self = this;
    self._super.find(self._id, function (singleton) {
        if (singleton) {
            return fn(singleton);
        }
        self._super.create({}, function (err, obj) {
            return fn(obj);
        });
    });
};

module.exports = Singleton;