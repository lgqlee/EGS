var moment = require('moment');

// 将对象变为字符串类型
var string = function (obj) {
    return obj.toString();
};

// 将字符串变成布尔值
// 其中 'true' '1' 1 会返回 true，其他全部返回 false
// @return Boolean
var true_str_arr = ['true', '1', 1];
var bool = function (str) {
    return true_str_arr.indexOf(str) > -1;
};

// 将布尔型变成字符串
var bool2String = function (bool) {
    return bool ? 1 : 0;
};

// 将moment变成 Date 字符串
var data = function (mem_obj) {
    return mem_obj.format('YYYY-MM-DD')
};

// 将moment变成 DataTime 字符串
var dataTime = function (mem_obj) {
    return mem_obj.format('YYYY-MM-DD HH:mm:ss')
};

module.exports = {
    Int: {
        dbFormat: string,
        parse: parseInt
    },
    Float: {
        dbFormat: string,
        parse: parseFloat
    },
    Boolean: {
        dbFormat: bool2String,
        parse: bool
    },
    Date: {
        dbFormat: data,
        parse: moment
    },
    DateTime: {
        dbFormat: dataTime,
        parse: moment
    }
};