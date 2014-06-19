var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Model = require('../../lib/active_record/model');
var redis = require('../../lib/active_record/db_pool').redis;
var mysql = require('../../lib/active_record/db_pool').mysql;
var type_parse = require('../../lib/active_record/type_parse');
var Queue = require('../../lib/active_record/queue');
var redis_persist_key = require('../../lib/core_loader').config['sys']['redis_persist_key'];

var test_table = 'test_table';

var mysql_queue = Queue.create('db_queue', {
    db_name: redis_persist_key
});

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

var User = Model.extend('user', {name: 'String:vt', age: 'Int:13', create_at: 'DateTime#now'}, {
    expire: 100000
});

describe('model extend', function () {
    it('should exist __options', function (done) {
        User.create({}, function (err, vt) {
            vt._is_new.should.equal(false);
            vt._options.db_name.should.eql('egame_act_user');
            vt.name.should.equal('vt');
            vt.age.should.equal(13);
            done();
        });

    });
});

describe('model create', function () {
    it('should 22 year old', function (done) {
        User.create({
            name: 'vincent',
            age: 22
        }, function (err, user) {
            user.age.should.equal(22);
            done();
        });
    });
    it('should exist in redis', function (done) {
        User.create({
            name: 'vincent',
            age: 22
        }, function (err, user) {
            redis.hgetall('egame_act_user_' + user.id, function (err, user_info) {
                user_info['name'].should.equal('vincent');
                done();
            });
        });
    });
    it('should format', function (done) {
        User.create({
            name: 'vincent',
            age: 22
        }, function (err, user) {
            redis.hgetall('egame_act_user_' + user.id, function (err, user_info) {
                user_info['name'].should.equal('vincent');
                type_parse['DateTime'].dbFormat(user.create_at).should.equal(user_info['create_at']);
                done();
            });
        });
    });
    it('should in sql_queue', function (done) {
        mysql_queue.destroy(function () {
            User.create({
                name: 'vincent',
                age: 22
            }, function (err, user) {
                mysql_queue.pop(function (data) {
                    JSON.parse(data)['method'].should.equal('insert');
                    JSON.parse(data)['content']['id'].should.equal(user.id);
                    done();
                })
            });
        })
    });
});

describe('model incrby', function () {
    it('should equal', function (done) {
        User.create({
            name: 'vincent',
            age: 22
        }, function (err, user) {
            user.incrBy('age', 1, function (age) {
                redis.hgetall(user._options['redis_prefix'] + user.id, function (err, hash) {
                    hash['age'].should.eql(age);
                    done();
                })
            });
        });
    });
});

describe('model destroy', function () {
    it('should equal', function (done) {
        User.create({
            name: 'vincent',
            age: 22
        }, function (err, user) {
            redis.flushall(function () {
                user.destroy(function () {
                    redis.exists(user._options['redis_prefix'] + user.id, function (err, result) {
                        result.should.eql(false);
                        mysql_queue.pop(function (obj) {
                            JSON.parse(obj).method.should.equal('delete');
                            done();
                        })
                    })
                })
            });
        });
    });
});