var path = require('path');
var mysql = require('../../lib/active_record/db_pool').mysql;
var redis = require('../../lib/active_record/db_pool').redis;
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var test_table = 'test_table';

var db_init = function (fn) {
    redis.flushdb(function () {
        mysql.getConnection(function (err, connection) {
            if (err) throw Error(err);
            connection.query('CREATE DATABASE IF NOT EXISTS development', function (err) {
                if (err) throw Error(err);
                connection.query('DROP TABLE IF EXISTS ' + test_table + ';', function (err) {
                    if (err) throw Error(err);
                    connection.query('create table ' + test_table + '  (id varchar(45) not null unique,name varchar(45), age varchar(45)); ', function (err) {
                        if (err) throw Error(err);
                        connection.query('insert into ' + test_table + ' values("123456", "vt", "15"),("123457", "paul", "22");', function (err) {
                            if (err) throw Error(err);
                            fn();
                        })
                    });
                    connection.release();
                });
            })
        });
    });
};

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

describe('model init', function () {
    it('should return directly', function (done) {
        var model_b = Model.extend('a', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'});
        var jack = model_b.init({'name': 'jack'});
        jack.name.should.equal('jack');
        done();
    });
});

describe('model create', function () {
    it('should async', function (done) {
        var model_b = Model.extend('b', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'});
        model_b.create({
            name: 'jack',
            age: 22
        }, function (err, user) {
            user.age.should.equal(22);
            done();
        });
    });
});

describe('model where', function () {
    var User = Model.extend('b', {name: 'String:vt', age: 'Int:13'}, {db_name: test_table});
    it('should length 1', function (done) {
        db_init(function () {
            User.where({age: {gt: 16}}, function (objs) {
                objs.length.should.equal(1);
                objs[0].name.should.equal('paul');
                done();
            });
        });
    });
    it('should support limit', function (done) {
        db_init(function () {
            User.where({age: {gt: 0}}, function (objs) {
                objs.length.should.equal(1);
                objs[0].name.should.equal('vt');
                done();
            }, [0, 1]);
        });
    });
});

describe('model find', function () {
    it('should return when redis not exist', function (done) {
        var User = Model.extend('b', {name: 'String:vt', age: 'Int:13'}, {db_name: test_table, expire: 10});
        db_init(function () {
            User.find('123456', function (obj) {
                obj.name.should.equal('vt');
                done();
            });
        });
    });
    it('should return when redis exist', function (done) {
        var User = Model.extend('b', {name: 'String:vt', age: 'Int:13'}, {db_name: test_table, expire: 10});
        User.find('123456', function (obj) {
            obj.name.should.equal('vt');
            done();
        });
    });
});