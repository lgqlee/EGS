var path = require('path');
process.env['EGS_ROOT'] = path.join(process.cwd(), 'tests/apps');

var should = require('should');
var Queue = require('../../lib/active_record/queue');
var redis_conn = require('../../lib/active_record/db_pool').redis;

describe('queue create', function () {
    it('should use sys db prefix', function (done) {
        var queue_1 = Queue.create('aa');
        queue_1.queue_name.should.equal('egame_act_aa');
        done();
    });
    it('should use custom name', function (done) {
        var queue_2 = Queue.create('1', {db_name: 'hello'});
        queue_2.queue_name.should.equal('hello');
        done();
    });
});


describe('queue push & pop', function () {
    var queue = Queue.create('test', {db_name: 'test_queue'});
    it('should allow string', function (done) {
        redis_conn.del(queue.queue_name, function () {
            queue.push('1', function (size) {
                size.should.equal(1);
                redis_conn.lrange(queue.queue_name, 0, -1, function (err, items) {
                    items.should.eql(['1']);
                    queue.pop(function (item) {
                        item.should.equal('1');
                        done();
                    });
                });
            });
        });
    });
});

describe('queue size && popMulti', function () {
    var queue = Queue.create('test', {db_name: 'test_queue_1'});
    it('should allow int', function (done) {
        redis_conn.del(queue.queue_name, function () {
            queue.push('1', function () {
                queue.push('2', function () {
                    queue.size(function (size) {
                        size.should.equal(2);
                        done();
                    })
                });
            });
        });
    });
});

describe('pushMulti', function () {
    var queue = Queue.create('test', {db_name: 'test_queue_2'});
    it('should allow -1', function (done) {
        redis_conn.del(queue.queue_name, function () {
            queue.pushMulti([1, 2, 3, 4], function(size){
                size.should.equal(4);
                done();
            })
        });
    });
});