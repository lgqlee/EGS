// Queue - 基于redis的List实现的队列
// 创建新的队列 var queue = Queue.create(name[, options])
// 其中 name 为唯一标识，options可以强制指定redis的key值，例如 {db_name: 'test_queue'}
// 插入队列 queue.push(item, function(size){}) size 为插入后的长度
// 插入队列多条数据 queue.pushMulti(items, function(size){}) size 为插入后的长度
// 取出元素 queue.pop(function(item){})
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

fn.push = function (item, fn) {
    // 如果不是字符串，转为 JSON 格式
    if (Object.prototype.toString.call(item).toLowerCase().indexOf('string') === -1) {
        item = JSON.stringify(item);
    }
    redis_conn.rpush(this.queue_name, item, function (err, len) {
        if (err) {
            throw Error(err);
        }
        fn && fn(len);
    });
};

fn.pushMulti = function (items, fn) {
    var args = items.concat([]);
    var self = this;
    args.unshift(this.queue_name);
    args.push(function (err, len) {
        if (err) {
            // 支持低版本的redis
            var multi = redis_conn.multi();
            items.forEach(function (item) {
                multi.lpush(self.queue_name, item);
            });
            multi.exec(function (err, replies) {
                if (err) throw Error(err);
                fn(replies[replies.length - 1]);
            });
            return;
        }
        fn && fn(len);
    });
    redis_conn.rpush.apply(redis_conn, args);
};

fn.pop = function (fn) {
    redis_conn.lpop(this.queue_name, function (err, item) {
        if (err) {
            throw Error(err);
        }
        fn && fn(item);
    });
};

fn.size = function (fn) {
    redis_conn.llen(this.queue_name, function (err, len) {
        if (err) {
            throw Error(err);
        }
        fn && fn(len);
    })
};

fn.destroy = function (fn) {
    redis_conn.del(this.queue_name, function (err) {
        if (err) {
            throw Error(err);
        }
        fn && fn();
    })
};

module.exports = Queue;