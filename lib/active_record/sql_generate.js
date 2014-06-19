// 将javascript的对象根据规则转化为 SQL 语句，基本的结构如下：
// {method: method, content: content, where: where, table:table_name, fields: field_list, limit: limit}
// 其中不同 method 支持的参数不一样，所有的 method 都必须有 table 参数，即操作的表名
// - - -
// method 为 select:
// 额外支持的参数：where fields limit
// method 为 delete:
// 额外支持的参数：where
// method 为 insert:
// 额外支持的参数：content
// method 为 update:
// 额外支持的参数：where content
// - - -
// 各字段说明如下：
// = fields 为字段列表，例如 ['name', 'age']
// = limit 为查询条数限制，支持 Array 和 Int 类型。例如 {limit: 5} 查询第一条到第五条，
// 如果是 {limit: [2, 10]}为第三到第十条
// = content 为字段和值的对应关系，例如 {content: {name: 'vincent', age: 22}}
// = where 支持简单查询和复杂查询。简单查询为条件和对应的值的对应关系，默认为等于。
// 例如 {where: {age: 22}} 相当于查找 age == 22 的。
// 复杂查询目前仅支持 lt[小于] gt[大于] like[模糊查询] not_eql[不等于]
// 支持例如 {where: {age: {lt: 22, not_eql: 35}}} 的条件

// Where 查询中支持的特殊查询条件
var __operators_hash = {
    lt: '<',
    gt: '>',
    like: 'LIKE',
    not_eql: '<>'
};

var content_parse = function (content) {
    var key_arr = [], value_arr = [], key;
    for (key in content) {
        if (content.hasOwnProperty(key)) {
            key_arr.push(key + ' = ?');
            value_arr.push(content[key]);
        }
    }
    return {
        keys: key_arr,
        values: value_arr
    }
};

var where_parse = function (where) {
    var key, key_arr = [], value_arr = [];
    for (key in where) {
        if (where.hasOwnProperty(key)) {
            var stint = where[key];
            if (Object.prototype.toString.apply(stint).indexOf('Object') !== 8) {
                key_arr.push(key + ' = ?');
                value_arr.push(stint);
                continue;
            }
            var condition, operators;
            for (condition in stint) {
                if (stint.hasOwnProperty(condition) && __operators_hash.hasOwnProperty(condition)) {
                    operators = __operators_hash[condition];
                    key_arr.push(key + ' ' + operators + ' ?');
                    value_arr.push(stint[condition]);
                }
            }
        }
    }
    return {
        keys: key_arr,
        values: value_arr
    }
};

var insert_generate = function (table, content) {
    var sql = 'INSERT INTO ' + table + ' SET ',
        params;
    params = content_parse(content);
    return {
        sql: sql + params['keys'].join(', '),
        values: params['values']
    }
};

var delete_generate = function (table, where) {
    var sql = 'DELETE FROM ' + table + ' WHERE ',
        params;
    params = where_parse(where);
    return {
        sql: sql + params['keys'].join(' AND '),
        values: params['values']
    };
};

var update_generate = function (table, content, where) {
    var sql = 'UPDATE ' + table + ' SET ',
        content_params, where_params;
    content_params = content_parse(content);
    sql += (content_params['keys'].join(', ') + ' WHERE ');
    where_params = where_parse(where);
    return {
        sql: sql + where_params['keys'].join(' AND '),
        values: content_params['values'].concat(where_params['values'])
    };
};

var select_generate = function (table, fields, where, limit) {
    var sql = 'SELECT ' + fields.join(', ') + ' FROM ' + table + ' WHERE ',
        params, limit_sql = '';
    params = where_parse(where);
    if (limit) {
        if (limit[1]) {
            limit[1] = limit[1] - limit[0];
            limit_sql += ' LIMIT ' + limit.join(', ');
        } else {
            limit_sql += ' LIMIT ' + limit;
        }
    }
    return {
        sql: sql + params['keys'].join(' AND ') + limit_sql,
        values: params['values']
    };
};

module.exports.generate = function (obj) {
    switch (obj['method'].toLowerCase()) {
        case 'insert':
            return insert_generate(obj['table'], obj['content']);
        case 'delete':
            return delete_generate(obj['table'], obj['where']);
        case 'update':
            return update_generate(obj['table'], obj['content'], obj['where']);
        case 'select':
            return select_generate(obj['table'], obj['fields'], obj['where'], obj['limit']);
    }
};
