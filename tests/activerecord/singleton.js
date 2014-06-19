var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Singleton = require('../../lib/active_record/singleton');
//var redis_conn = require('../../lib/active_record/db_pool').redis;

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

describe('multi singleton', function () {
    it('should different', function (done) {
        var M1 = Singleton.extend('test_1a', {
            "num": "Int"
        });
        M1.meta.helo = function () {
            return 1;
        };
        M1.get(function (singleton) {
            singleton.helo().should.equal(1);

            var M2 = Singleton.extend('test_1a', {
                "num": "Int"
            });
            M2.meta.helo = function () {
                return 2;
            };
            M2.get(function (singleton) {
                singleton.helo().should.equal(2);
                M1.get(function (singleton) {
                    singleton.helo().should.equal(1);
                    done();
                })
            })
        });
    });
});