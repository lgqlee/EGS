var path = require('path');
var fs = require('fs');
var sys_root_config = require('../../config/sys');

// Synchronous list all child dirs under a dir.
var listChildDirs = function (dir_name) {
    return fs.readdirSync(dir_name).filter(function (name) {
        return name.indexOf('.') === -1;
    })

};

// Check dir if app root.
var isAppRoot = function (dir_path) {
    try {
        var pk_file = path.join(dir_path, 'package.json');
        return Boolean(require(pk_file)['dependencies']['egs']);
    } catch (_) {
        return false;
    }
};

// Get parent dir.
// If param dir_path is sys root path return false.
var getParentDir = function (dir_path) {
    var parent_dir = path.resolve(dir_path, '..');
    return parent_dir === dir_path ? false : parent_dir;
};

var find_app_root = function (cur_path) {
    cur_path = cur_path || process.env['EGS_ROOT'] || process.cwd();
    if (isAppRoot(cur_path)) {
        console.log('EGA app root: ' + cur_path);
        return cur_path;
    }
    var parent_path = getParentDir(cur_path);
    if (!parent_path) {
        throw Error('no EGS app root dir found!');
    }
    return find_app_root(parent_path);
};

var root_path = find_app_root();
var app_list = listChildDirs(path.join(root_path, sys_root_config['apps_dir']));

module.exports = {
    root_path: root_path,
    apps: app_list
};