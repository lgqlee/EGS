var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var type_parse = require('../../lib/active_record/type_parse');

describe('Int', function () {
    it('should return int', function (done) {
        type_parse['Int'].parse('12').should.equal(12);
        done();
    });
    it('should return string', function (done) {
        type_parse['Int'].dbFormat(12).should.equal('12');
        done();
    });
});

describe('Float', function () {
    it('should return float', function (done) {
        type_parse['Float'].parse('12.2').should.equal(12.2);
        done();
    });
    it('should return string', function (done) {
        type_parse['Float'].dbFormat(12.2).should.equal('12.2');
        done();
    });
});


describe('Float', function () {
    it('should return float', function (done) {
        type_parse['Float'].parse('12.2').should.equal(12.2);
        done();
    });
    it('should return string', function (done) {
        type_parse['Float'].dbFormat(12.2).should.equal('12.2');
        done();
    });
});


describe('Boolean', function () {
    it('should return true', function (done) {
        type_parse['Boolean'].parse('1').should.equal(true);
        done();
    });
    it('should return string', function (done) {
        type_parse['Boolean'].dbFormat(true).should.equal(1);
        done();
    });
});
