var type_parse = require('./type_parse');

var Individual = function () {
    this.init.apply(this, arguments);
};

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
        field_obj['default'] || this.fn[field_obj['func']].apply(this);
    return parser ? parser.parse(value) : value;
};

fn.init = function (model, params, is_new) {
    var fns = ['_fields', '_options', 'fn', 'verify'],
        self = this, field;
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
};

module.exports = Individual;