var express = require('express');
var getTask = require('../task_parse').getTask;

var router = express.Router();

router.get('/task', function (req, res) {
    var app_name = req.param('app');
    var task_name = req.param('task');
    var fn;
    try {
        fn = (getTask(app_name, task_name));
        fn(function () {
            res.send('ok');
        })
    } catch (_) {
        res.send('fail');
    }
});

module.exports = {
    router: router
};
