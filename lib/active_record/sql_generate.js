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
