var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Singleton = require('../../lib/active_record/singleton');

describe('singleton init', function () {
    it('should have _options as expected', function (done) {
        Singleton.create('test', {
            "num": "Int:15"
        }, function (singleton) {
            singleton.id.should.equal('test');
            singleton.num.should.equal(15);
            done();
        })
    });
    it('should remain', function (done) {
        Singleton.create('test', {
            "num": "Int"
        }, function (singleton) {
            singleton.num.should.equal(15);
            done();
        })
    });
});