var db_prefix = require('../core_loader').config['sys']['db_prefix'];
var Individual = require('./individual');
var sql_generate = require('./sql_generate').generate;
var db_pool = require('./db_pool');
var moment = require('moment');
var crypto = require('crypto');

var Model = function () {
    this.initialize.apply(this, arguments);
};


// 设置 expire 时会增加很多开销，慎用
var model_default_options = {
    mysql_only: false,
    redis_only: false,
    ignore_id: false,
    expire: false,
    db_name: '',
    redis_prefix: ''
};

Model.extend = function (name, fields, options) {
    var item;
    options = options || {};
    if (options['redis_only'] && options['mysql_only']) {
        throw Error('Redis_only & Mysql_only can not both be true!');
    }
    options['db_name'] = options['db_name'] || db_prefix + name;
    options['redis_prefix'] = options['redis_prefix'] || options['db_name'] + '_';
    for (item in model_default_options) {
        if (model_default_options.hasOwnProperty(item)) {
            options[item] = options[item] || model_default_options[item];
        }
    }
    return new Model(fields, options);
};

var fn = Model.prototype;

// 解析字段参数
// 根据关键字 : 和 # 来解析默认参数/运行方法
var field_parse = function (field_type) {
    var field_arr, parser;
    if (field_type.indexOf(':') !== -1) {
        field_arr = field_type.split(':');
        return {
            type: field_arr[0],
            // 默认参数需要转化为相应的类型
            default: field_arr[1]
        };
    }
    if (field_type.indexOf('#') !== -1) {
        field_arr = field_type.split('#');
        return {
            type: field_arr[0],
            func: field_arr[1]
        };
    }
    return {type: field_type};
};

fn.initialize = function (fields, options) {
    var field;
    this._fields = {};
    for (field in fields) {
        if (fields.hasOwnProperty(field)) {
            this._fields[field] = field_parse(fields[field]);
        }
    }
    // 如果没有忽略ID，自动添加ID字段
    // 如果值为空则手动生成
    if (!options['ignore_id']) {
        this._fields['id'] = {
            type: 'String',
            func: 'generateId'
        };
    }
    this._options = options;
    this.fn = {
        // 目前默认提供返回当时时间的方法
        now: moment,
        // 根据纳秒和表名生成随机ID
        generateId: function () {
            var str = this._options['table_name'] + Date.now() + process.hrtime();
            return crypto.createHash('md5').update(str).digest('hex');
        }
    };
    this.verify = {};
};

fn.init = function (params, is_new) {
    return new Individual(this, params, is_new);
};

fn.create = function (params, fn) {
    var individual = this.init(params, true);
    individual.save(fn);
};

var _mysql_query = function (filter, fn, limit) {
    var params = {
        table: this._options['db_name'],
        where: filter,
        fields: this._fields,
        method: 'select'
    };
    if (limit) {
        params['limit'] = limit
    }
    var sql_obj = sql_generate(params);
    db_pool.mysql.getConnection(function (err, connection) {
        if (err) throw Error(err);
        connection.query(sql_obj['sql'], sql_obj['values'], function (err, rows) {
            if (err) throw Error(err);
            fn(rows);
            connection.release();
        });
    });
};

fn.find = function (obj_id, fn) {
    var self = this;
    // Mysql only 模式数据直接从 Mysql 取出
    if (self._options['mysql_only']) {
        _mysql_query.call(self, {id: obj_id}, function (rows) {
            if (rows.length < 1) return fn(null);
            fn(self.init(rows[0]));
        });
        return;
    }
    db_pool.redis.hgetall(this._options['redis_prefix'] + obj_id, function (err, obj) {
        if (err) throw Error(err);
        if (obj) {
            return fn(self.init(obj));
        }
        if (self._options['redis_only']) return fn(null);
        // 如果 redis 中没有数据且 redis 设置了过期时间，则从数据中取
        if (self._options['expire']) {
            _mysql_query.call(self, {id: obj_id}, function (rows) {
                if (rows.length < 1) return fn(null);
                var record = self.init(rows[0]);
                record.saveRedis(fn)
            });
            return;
        }
        fn(null);
    })
};

fn.where = function (filter, fn, limit) {
    if (this._options['redis_only']) {
        throw Error('where query do not support in redis only mode');
    }
    var self = this;
    _mysql_query.call(this, filter, function (rows) {
        fn(rows.map(function (row) {
            return self.init(row);
        }));
    }, limit);
};

module.exports = Model;