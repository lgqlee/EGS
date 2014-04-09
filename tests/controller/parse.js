var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var controller_parse = require('../../lib/controller_parse').parse;


describe('parse route_obj', function () {
    it('should be obj', function (done) {
        controller_parse('demo', "get /hello", "user#hello"
        ).should.eql({
                method: 'get',
                url: '/hello',
                callback: require('../apps/demo/controllers/user_controller').hello
            });
        done();
    });
});