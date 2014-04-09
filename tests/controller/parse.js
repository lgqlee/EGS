process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var controller_parse = require('../../lib/core_loader/config_loader').parse;

describe('sys config', function () {
    it('should from root', function (done) {
        config_loader.sys['app_tasks_dir'].should.equal('tasks');
        done();
    });
    it('should from app', function (done) {
        config_loader.sys['redis_persist_key'].should.equal('queue');
        done();
    });
    it('should be database', function (done) {
        config_loader.database['mysql']['database'].should.equal('development');
        done();
    });
});

describe('app config', function () {
    it('should routes', function (done) {
        config_loader.load('demo', 'routes')['namespace'].should.equal('demo');
        done();
    });
});