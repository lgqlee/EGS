var os = require('os');
var fs = require('fs');
var mkdirp = require('mkdirp');

var eol = os.EOL;

var package_json = function (name) {
    return [
        '{' ,
            '   "name": "' + name + '",',
        '   "description": "EGS app",',
        '   "scripts": {',
        '       "start": "node app.js",',
        '       "test": "mocha tests/*/*.js"',
        '   },',
        '   "dependencies": {',
        '       "egserver": "*"',
        '   },',
        '   "devDependencies": {',
        '       "mocha": "~1.17.1",',
        '       "should": "~2.1.1",',
        '       "superagent": "*"',
        '   }',
        '}'
    ].join(eol);
};

var app_js = [
    "var egs = require('egserver');",
    'egs.start(function () {',
    "    console.log('Server is running at port: ' + this.get('port'));",
    '});'
].join(eol);

var database_json = function (name) {
    return [
        '{',
        '    "production": {',
        '       "redis": {',
        '           "host": "localhost"',
        '        },',
        '       "mysql": {',
        '           "host": "localhost",',
        '            "user": "root",',
        '            "password": "",',
        '            "port": 3306,',
            '            "database": "' + name + '_production"',
        '        }',
        '    },',
        '    "development": {',
        '        "redis": {',
        '            "host": "localhost"',
        '        },',
        '        "mysql": {',
        '            "host": "",',
        '            "user": "",',
        '            "password": "",',
        '            "port": 3306,',
            '            "database": "' + name + '_development"',
        '        }',
        '    }',
        '}'
    ].join(eol);
};

var sys_json = [
    '{',
    '    "global_route_namespace": "ajax",',
    '    "redis_persist_key": "egs_redis_queue",',
    '    "db_prefix": "egs_"',
    '}'
].join(eol);

var routes_json = [
    '{',
    '    "namespace": false,',
    '    "routes": {',
    '',
    '    }',
    '}'
].join(eol);

var tasks_json = [
    '{',
    '    "init": [',
    '',
    '],',
    '    "timer": [',
    '',
    '    ]',
    '}'
].join(eol);

var requirements_json = [
    '[',
    '',
    ']'
].join(eol);

var create_keep = function (dir) {
    write(dir + '/.keep', '');
};

// 检测文件夹是否为空
function emptyDirectory(path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && 'ENOENT' != err.code) throw err;
        fn && fn(!files || !files.length);
    });
}

// 将字符串写入 path
function write(path, str) {
    fs.writeFile(path, str);
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

// 新建文件夹
function mkdir(path, fn) {
    mkdirp(path, 0755, function (err) {
        if (err) throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn(path);
    });
}

module.exports.create = function (name) {
    var current_dir = process.cwd();
    emptyDirectory(current_dir, function (is_empty) {
        if (!is_empty)return console.log('Can not create files in non-empty dir');
        mkdir(current_dir + '/apps');
        mkdir(current_dir + '/config', function (config_dir) {
            write(config_dir + '/database.json', database_json(name));
            write(config_dir + '/sys.json', sys_json);
        });
        mkdir(current_dir + '/tests', create_keep);
        write(current_dir + '/app.js', app_js);
        write(current_dir + '/package.json', package_json(name));
    });
};

module.exports.generate = function (app_root, name) {
    mkdir(app_root + '/apps/' + name, function (app_dir) {
        mkdir(app_dir + '/tasks', create_keep);
        mkdir(app_dir + '/models', create_keep);
        mkdir(app_dir + '/controllers', create_keep);
        mkdir(app_dir + '/config', function (config_dir) {
            write(config_dir + '/routes.json', routes_json);
            write(config_dir + '/tasks.json', tasks_json);
            write(config_dir + '/requirements.json', requirements_json);
        });
    });
};