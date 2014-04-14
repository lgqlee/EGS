var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Model = require('../../lib/active_record/model');

var User = Model.extend('user', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'});

describe('model extend', function () {
    it('should exist __options', function (done) {
        var vt = User.create();
        vt._options.db_name.should.eql('egame_act_user');
        vt.name.should.equal('vt');
        vt.age.should.equal(13);
        done();
    });
});