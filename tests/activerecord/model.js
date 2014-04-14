var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Model = require('../../lib/active_record/model');

describe('model extend', function () {
    it('should generate auto', function (done) {
        var model_a = Model.extend('a', {});
        model_a._options['db_name'].should.equal('egame_act_a');
        model_a._options['redis_prefix'].should.equal('egame_act_a_');
        done();
    });
    it('should overwrite', function (done) {
        var model_b = Model.extend('a', {name: 'String'}, {redis_only: true, redis_prefix: 'Hello_'});
        model_b._options['redis_prefix'].should.equal('Hello_');
        model_b._options['redis_prefix'].should.equal('Hello_');
        model_b._options['redis_only'].should.equal(true);
        model_b._fields['name'].should.eql({type: 'String'});
        done();
    });
});

describe('model fields parse', function () {
    it('should as string', function (done) {
        var model_a = Model.extend('a', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'});
        model_a._fields.name.should.eql({type: 'String', default: 'vt'});
        done();
    });
    it('should as func', function (done) {
        var model_c = Model.extend('a', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'});
        model_c._fields.create_at.should.eql({type: 'DateTime', func: 'now'});
        done();
    });
});