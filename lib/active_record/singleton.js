var Model = require('./model');

var name_2_singleton = {};

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
    this._super.meta = this.meta = {};
    return this._super;
};

fn.get = function (fn) {
    var self = this;
    self._super.find(self._id, function (singleton) {
        if (singleton) {
            name_2_singleton[self._id] = singleton;
            return fn && fn(singleton);
        }
        self._super.create({}, function (err, obj) {
            name_2_singleton[self._id] = obj;
            return fn && fn(obj);
        });
    });
};

module.exports = Singleton;