var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Singleton = require('../../lib/active_record/singleton');

describe('singleton init', function () {
    it('should have _options as expected', function (done) {
        Singleton.extend('test', {
            "num": "Int:15"
        }).get(function (singleton) {
            singleton.id.should.equal('test');
            singleton.num.should.equal(15);
            done();
        })
    });
    it('should remain', function (done) {
        Singleton.extend('test', {
            "num": "Int"
        }).get(function (singleton) {
            singleton.num.should.equal(15);
            done();
        })
    });
});