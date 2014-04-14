var db_prefix = require('../core_loader').config['sys']['db_prefix'];
var type_parse = require('./type_parse');

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

Model.extend = function (name, fileds, options) {
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
    return new Model(fileds, options);
};

var fn = Model.prototype;

// 解析字段参数
// 根据关键字 : 和 # 来解析默认参数/运行方法
var filed_parse = function (field_type) {
    var filed_arr, parser;
    if (field_type.indexOf(':') !== -1) {
        filed_arr = field_type.split(':');
        parser = type_parse[filed_arr[0]];
        return {
            type: filed_arr[0],
            // 默认参数需要转化为相应的类型
            default: parser ? parser.parse(filed_arr[1]) : filed_arr[1]
        };
    }
    if (field_type.indexOf('#') !== -1) {
        filed_arr = field_type.split('#');
        return {
            type: filed_arr[0],
            func: filed_arr[1]
        };
    }
    return {type: field_type};
};

fn.init = function (fileds, options) {
    var filed;
    this._fileds = {};
    for (filed in fileds) {
        if (fileds.hasOwnProperty(filed)) {
            this._fileds[filed] = filed_parse(fileds[filed]);
        }
    }
    this._options = options;
    this.fn = {};
    this.verify = {};
};

fn.create = function () {

};

fn.find = function () {

};

fn.where = function () {

};

module.exports = Model;