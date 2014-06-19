var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var task_parse = require('../../lib/task_parse').parse;
var later = require('later');

var helloWorld = require('../apps/demo/tasks/hello').world;

describe('parse task_obj', function () {
    it('should parse str to function', function (done) {
        task_parse('demo', "hello#world"
        ).should.eql(helloWorld);
        done();
    });
});