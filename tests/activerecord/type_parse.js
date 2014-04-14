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
