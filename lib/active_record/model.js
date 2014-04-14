var db_prefix = require('../core_loader').config['sys']['db_prefix'];
var Individual = require('./individual');
var moment = require('moment');
var crypto = require('crypto');

var Model = function () {
    this.init.apply(this, arguments);
};

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

fn.init = function (fields, options) {
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
        // 根据纳秒和表命生成随机ID
        generateId: function () {
            var str = this._options['table_name'] + Date.now() + process.hrtime();
            return crypto.createHash('md5').update(str).digest('hex');
        }
    };
    this.verify = {};
};

fn.create = function (params) {
    return new Individual(this, params, true)
};

fn.find = function () {

};

fn.where = function () {

};

module.exports = Model;