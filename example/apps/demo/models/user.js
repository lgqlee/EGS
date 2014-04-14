var Model = {extend: function () {
}, fn: {}, verify: {}};

var User = Model.extend('user', {
    name: 'String',
    age: 'Int',
    email: 'String',
    create_at: 'DateTime#current_time',
    sex: 'String:female'
});

User.fn.current_time = function () {
    return Date.now();
};

User.verify.name = function (name) {
    return name === 'vt';
};