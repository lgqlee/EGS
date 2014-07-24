var path = require('path');
var root_path = require('./root_explore').root_path;

module.exports.loadFromFile = function (file, type, name) {
    var relative_path = path.relative(root_path, file).split(path.sep);
    return require(path.join(
        root_path,
        relative_path[0],
        relative_path[1],
        type,
        name
    ));
};