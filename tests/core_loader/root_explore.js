var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var root_explore = require('../../lib/core_loader/root_explore');

describe('root path explore', function () {
    it('should be the root path', function (done) {
        root_explore.root_path.should.equal( path.join(process.cwd(), 'tests'));
        done();
    });
});

describe('app list', function () {
    it('should have one app', function (done) {
        root_explore.apps.should.eql(['demo']);
        done();
    });
});