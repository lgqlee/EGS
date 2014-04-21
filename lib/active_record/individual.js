var type_parse = require('./type_parse');
var db_pool = require('./db_pool');
var Queue = require('./queue');
var redis_persist_key = require('../core_loader').config['sys']['redis_persist_key'];

var Individual = function () {
    this.init.apply(this, arguments);
};

var mysql_queue = new Queue('db_queue', {
    db_name: redis_persist_key
});

var fn = Individual.prototype;

// 为 field 中的字段绑定 getter 和 setter 方法
// 如果数据发生变化，将其 dirty 设为 true
var _fieldListener = function (field, field_obj) {
    this.__defineGetter__(field, function () {
        return field_obj['value'];
    });
    this.__defineSetter__(field, function (arg) {
        field_obj['dirty'] = true;
        field_obj['value'] = arg;
    });
};

// 数据的初始化
// 用户定义的数据 =》 默认的数据 =》 默认方法返回值
var _value_init = function (field_obj, cus_value) {
    var parser = type_parse[field_obj['type']];
    var value = cus_value ||
        field_obj['default'] ||
        this.fn[field_obj['func']] && this.fn[field_obj['func']].apply(this);
    return parser ? parser.parse(value) : value;
};

// Individual 初始化
fn.init = function (model, params, is_new) {
    var fns = ['_fields', '_options', 'fn', 'verify'],
        self = this, field,
        func;
    params = params || {};
    fns.forEach(function (fn) {
        self[fn] = model[fn];
    });
    // 遍历所有字段，添加当前值
    // 新数据 dirty 默认为 true
    for (field in this._fields) if (this._fields.hasOwnProperty(field)) {
        var field_obj = this._fields[field];
        field_obj['value'] = _value_init.call(this, field_obj, params[field]);
        field_obj['dirty'] = Boolean(is_new);
        _fieldListener.call(this, field, field_obj);
    }
    for (func in this.meta) if (this.meta.hasOwnProperty(func)) {
        fn.func = this.meta[func];
    }
    this._is_new = is_new;
    // 初始化 redis_id
    if (!this._options['mysql_only']) this['redis_key'] = this._options['redis_prefix'] + this['id'];
};

// 直接对redis中的整型数字类型数据进行操作
// 高并发下面 Mysql 中的数据有一定可能性的错误率，需要注意
fn.incrBy = function (field, num, fn) {
    if (this._options['mysql_only']) {
        throw Error('incrBy do not support in mysql only mode');
    }
    var self = this;
    db_pool.redis.hincrby(this['redis_key'], field, num,
        function (err, result) {
            if (err)throw Error(err);
            self[field] = parseInt(result);
            fn(result);
        }
    )
};

// 直接对redis中的浮点型数字类型数据进行操作
// 高并发下面 Mysql 中的数据有一定可能性的错误率，需要注意
fn.incrFloatBy = function (field, num, fn) {
    if (this._options['mysql_only']) {
        throw Error('incrFloatBy do not support in mysql only mode');
    }
    var self = this;
    db_pool.redis.hincrbyfloat(this['redis_key'], field, num,
        function (err, result) {
            if (err)throw Error(err);
            self[field] = result;
            fn(result);
        }
    )
};

// 获取变化过的字段，并转换类型
// 如果参数 is_all 为 true，着返回所有字段
var _getDirtyFields = function (is_all) {
    var result = {'|errors': []}, field;
    for (field in this._fields) if (this._fields.hasOwnProperty(field)) {
        var field_obj = this._fields[field];
        if (is_all || field_obj['dirty']) {
            var parser = type_parse[field_obj['type']];
            result[field] = parser ?
                parser.dbFormat(field_obj['value']) : field_obj['value'];
            var field_verify = this.verify[field];
            if (field_verify && !field_verify(result[field])) {
                result['|errors'].push(field);
            }
        }
    }
    if (result['|errors'].length === 0) delete result['|errors'];
    return result;
};

// 写入数据库新建/修改队列
fn.saveDB = function (fn, fields) {
    var self = this;
    if (this._options['redis_only']) {
        return fn && fn(false, self)
    }
    if (!fields) {
        if (this._options['redis_only']) {
            throw Error('Redis only mode can not use saveDB directly');
        }
        fields = _getDirtyFields.call(this);
        if (fields['|errors']) {
            return fn || fn(fields['|errors'], self);
        }
    }
    var sql_params = {
        table: this._options['table_name'],
        content: fields,
        method: this._is_new ? 'insert' : 'update'
    };
    if (!this._is_new) {
        sql_params['where'] = {
            id: this.id
        }
    } else {
        this._is_new = false;
    }
    mysql_queue.push(sql_params, function () {
        fn(false, self);
    });
};

// 查看redis中是否存在key
var _checkKey = function (fn) {
    var self = this;
    if (!this._options['expire']) {
        return fn.call(this, true)
    }
    db_pool.redis.exists(self['redis_key'], function (err, is_exist) {
        if (err) throw Error(err);
        fn.call(this, is_exist);
    });
};

// 直接更新 redis
// 如果设置中允许设置了 expire 则要检测 key 是否存在
// key 过期需要取所有字段然后更新
fn.saveRedis = function (fn, fields) {
    var self = this;
    if (this._options['mysql_only']) {
        return fn && fn(false, self);
    }
    _checkKey.call(this, function (is_exist) {
        // 如果没有字段或者redis中不存在
        if (!fields || !is_exist) {
            if (self._options['mysql_only']) {
                throw Error('Mysql only mode can not use saveRedis directly');
            }
            // 如果不存在则要使用将 all 设为 true
            fields = _getDirtyFields.call(self, !is_exist);
            if (fields['|errors']) {
                return fn || fn(fields['|errors'], self)
            }
        }
        db_pool.redis.hmset(self['redis_key'], fields,
            function (err) {
                if (err) throw Error(err);
                if (!self._options['expire'] || self._is_new) {
                    return fn && fn(false, self);
                }
                db_pool.redis.expire(this['redis_key'], self._options['expire'], function (err) {
                    if (err) throw Error(err);
                    return fn && fn(false, self);
                });
            });
    });
};

// 根据model配置自动选择更新
fn.save = function (fn) {
    var self = this;
    var fields = _getDirtyFields.call(this);
    if (fields['|errors']) {
        return fn && fn(fields['|errors'], self)
    }
    this.saveRedis(function (err) {
        if (err) {
            return fn(err, self);
        }
        self.saveDB(fn, fields);
    }, fields);
};

// 将数据从 redis 中删除
fn.destroyRedis = function (fn) {
    if (this._options['mysql_only']) {
        return fn && fn()
    }
    db_pool.redis.del(this['redis_key'], function (err) {
        if (err) throw Error(err);
        fn && fn();
    });
};

// 添加 Mysql 数据删除队列
fn.destroyDB = function (fn) {
    if (this._options['redis_only']) {
        return fn && fn()
    }
    mysql_queue.push(
        {
            table: this._options['table_name'],
            where: {
                id: this['id']
            },
            method: 'delete'
        },
        fn);
};

// 自动选择删除该对象的数据
fn.destroy = function (fn) {
    var self = this;
    this.destroyDB(function () {
        self.destroyRedis(fn);
    });
};

module.exports = Individual;