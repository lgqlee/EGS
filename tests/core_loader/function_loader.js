var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var function_loader = require('../../lib/core_loader/function_loader');

describe('function config', function () {
    it('should load form controller', function (done) {
        function_loader.load('demo', 'controllers', 'hello#world').should.eql(require('../apps/demo/controllers/hello').world);
        done();
    });
    it('should load form task', function (done) {
        function_loader.load('demo', 'tasks', 'hello#world').should.eql(require('../apps/demo/tasks/hello').world);
        done();
    });
});