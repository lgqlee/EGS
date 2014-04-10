// Queue - 基于redis的List实现的队列
//

var redis_conn = require('./db_pool').redis;
var db_prefix = require('../core_loader').config['sys']['db_prefix'];

var Queue = function () {
    this.init.apply(this, arguments);
};

Queue.create = function (name, options) {
    return new Queue(options && options['db_name']
        || db_prefix + name);
};

var fn = Queue.prototype;

fn.init = function (queue_name) {
    this.queue_name = queue_name;
};

fn.push = function (item, callback) {
// node-redis 目前不支持多个 item 同时 rpush，多键值 rpush 需等待 node-redis 支持
// 暂不使用 multi 方法进行补丁
    redis_conn.rpush(this.queue_name, item, function (err, len) {
        if (err) {
            throw Error(err);
        }
        callback(len);
    });
};

fn.pop = function (callback) {
    redis_conn.lpop(this.queue_name, function (err, item) {
        if (err) {
            throw Error(err);
        }
        callback(item);
    });
};

var popMulti = function (size, callback) {
    var self = this;
    redis_conn.lrange(this.queue_name, '0', size - 1, function (err, items) {
        if (err) {
            throw Error(err);
        }
        redis_conn.ltrim(self.queue_name, size, '-1', function (err) {
            if (err) {
                throw Error(err);
            }
            callback(items);
        });
    });
};

fn.popMulti = function (size, callback) {
    var self = this;
    if (size > 0) {
        return popMulti.apply(this, arguments);
    }
    this.size(function (len) {
        return popMulti.call(self, len, callback);
    })
};

fn.size = function (callback) {
    redis_conn.llen(this.queue_name, function (err, len) {
        if (err) {
            throw Error(err);
        }
        callback(len);
    })
};

fn.destroy = function (callback) {
    redis_conn.del(this.queue_name, function (err) {
        if (err) {
            throw Error(err);
        }
        callback();
    })
};

module.exports = Queue;