// Queue - 基于redis的List实现的队列
// 创建新的队列 var queue = Queue.create(name[, options])
// 其中 name 为唯一标识，options可以强制指定redis的key值，例如 {db_name: 'test_queue'}
// 插入队列 queue.push(item, function(size){}) size 为插入后的长度
// 取出元素 queue.pop(function(item){})
// 取出多个元素 queue.popMulti(size, function(items){})
// 其中 size 如果为 -1 则表示取出所有的元素（当时）
// 获取当前队列长度 queue.size(function(size){})
// 高并发下慎用该方法，可能存在数据的错误
// 销毁队列 queue.destroy(function(){}) 销毁且不返回任何数据

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
        // 为了防止高并发下的问题，这里 ltrim 的第二个参数必须为 items.length，否则可能删除多余的元素
        redis_conn.ltrim(self.queue_name, items.length, '-1', function (err) {
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