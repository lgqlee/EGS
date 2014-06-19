var should = require('should');
var generate = require('../../lib/active_record/sql_generate').generate;

describe('sql insert', function () {
    it('should the same as expect', function (done) {
        var obj = generate({table: 'name_a', content: {a: 1, b: 2, c: 3}, method: 'insert'});
        obj.sql.should.equal('INSERT INTO name_a SET a = ?, b = ?, c = ?');
        obj.values.should.eql([1, 2, 3]);
        done();
    });
});

describe('sql delete', function () {
    it('should the same as expect', function (done) {
        var obj = generate({table: 'name_a', where: {a: 1, b: 2}, method: 'delete'});
        obj.sql.should.equal('DELETE FROM name_a WHERE a = ? AND b = ?');
        obj.values.should.eql([1, 2]);
        done();
    });
    it('where expression should be the same as expect', function (done) {
        var obj = generate({table: 'name_a', where: {c: {gt: 1}, d: {lt: 2}, e: {not_eql: 3}, f: {like: 4}}, method: 'delete'});
        obj.sql.should.equal('DELETE FROM name_a WHERE c > ? AND d < ? AND e <> ? AND f LIKE ?');
        obj.values.should.eql([1, 2, 3, 4]);
        done();
    });
});

describe('sql update', function () {
    it('should the same as expect', function (done) {
        var obj = generate({table: 'name_a', content: {a: 1, b: 2}, where: {c: 3, d: 4}, method: 'update'});
        obj.sql.should.equal('UPDATE name_a SET a = ?, b = ? WHERE c = ? AND d = ?');
        obj.values.should.eql([1, 2, 3, 4]);
        done();
    });
});

describe('sql select', function () {
    it('should the same as expect', function (done) {
        var obj = generate({table: 'name_a', fields: ['a', 'b'], where: {c: 3, d: 4}, method: 'select'});
        obj.sql.should.equal('SELECT a, b FROM name_a WHERE c = ? AND d = ?');
        obj.values.should.eql([3, 4]);
        done();
    });
    it('where expression should be the same as expect', function (done) {
        var obj = generate({table: 'name_a', fields: ['a', 'b'], where: {c: {gt: 1}, d: {lt: 2}, e: {not_eql: 3}, f: {like: 4}}, method: 'select'});
        obj.sql.should.equal('SELECT a, b FROM name_a WHERE c > ? AND d < ? AND e <> ? AND f LIKE ?');
        obj.values.should.eql([1, 2, 3, 4]);
        done();
    });
    it('where expression should be the same as expect', function (done) {
        var obj = generate({table: 'name_a', fields: ['a', 'b'], where: {c: {gt: 1, lt: 2}}, method: 'select'});
        obj.sql.should.equal('SELECT a, b FROM name_a WHERE c > ? AND c < ?');
        obj.values.should.eql([1, 2]);
        done();
    });
    it('limit expression should be the same as expect when is number', function (done) {
        var obj = generate({table: 'name_a', fields: ['a', 'b'], where: {c: {gt: 1, lt: 2}}, method: 'select', limit: 5});
        obj.sql.should.equal('SELECT a, b FROM name_a WHERE c > ? AND c < ? LIMIT 5');
        obj.values.should.eql([1, 2]);
        done();
    });
    it('limit expression should be the same as expect where is array', function (done) {
        var obj = generate({table: 'name_a', fields: ['a', 'b'], where: {c: {gt: 1, lt: 2}}, method: 'select', limit: [5, 10]});
        obj.sql.should.equal('SELECT a, b FROM name_a WHERE c > ? AND c < ? LIMIT 5, 5');
        obj.values.should.eql([1, 2]);
        done();
    });
});