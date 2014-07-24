var path = require('path');
var fs = require('fs');
var sys_root_config = require('../../config/sys');

// 使用同步方式获取文件夹下面的所有文件夹
// @param dir_name 文件夹的绝对路径
// @return Array 文件夹名称列表
var listChildDirs = function (dir_name) {
    return fs.readdirSync(dir_name).filter(function (name) {
        return name.indexOf('.') === -1;
    })
};

// 验证当前目录是否为EGS项目的根目录
// @param dir_path 需要验证的目录
// @return Boolean 是否是EGS项目根目录
var isAppRoot = function (dir_path) {
    try {
        var pk_file = path.join(dir_path, 'package.json');
        return Boolean(require(pk_file)['dependencies']['egserver']);
    } catch (_) {
        return false;
    }
};

// 获取目录的上级目录，如果已至根目录则返回 false
var getParentDir = function (dir_path) {
    var parent_dir = path.resolve(dir_path, '..');
    return parent_dir === dir_path ? false : parent_dir;
};

// 根据 package.json 中的依赖关系定位根目录，通过递归如果至根目录仍
// 不符合则直接抛出异常
// @param cur_path 当前目录
// @return 寻找到的根目录地址
var findAppRoot = function (cur_path) {
    cur_path = cur_path || process.env['EGS_ROOT'] || process.cwd();
    if (isAppRoot(cur_path)) {
        return cur_path;
    }
    var parent_path = getParentDir(cur_path);
    if (!parent_path) {
        throw Error('no EGS app root dir found!');
    }
    return findAppRoot(parent_path);
};

var root_path = findAppRoot();
var app_list = listChildDirs(path.join(root_path, sys_root_config['apps_dir']));

module.exports = {
    root_path: root_path,
    apps: app_list
};