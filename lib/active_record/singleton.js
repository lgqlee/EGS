var db_prefix = require('../core_loader').config['sys']['db_prefix'];
var Individual = require('./individual');
var moment = require('moment');
var crypto = require('crypto');

var Singleton = function () {
    this.init.apply(this, arguments);
};

var singleton_default_options = {
    expire: false,
    redis_key: ''
};

Singleton.extend = function (name, fields, options) {

};

var fn = Singleton.prototype;

