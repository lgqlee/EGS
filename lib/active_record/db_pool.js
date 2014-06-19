var redis = require("redis"),
    mysql = require('mysql'),
    app_db_config = require('../core_loader').config['database'],
    redis_client = redis.createClient(
        app_db_config['redis'].port,
        app_db_config['redis'].host,
        app_db_config['redis'].options
    ),
    mysql_pool = mysql.createPool(app_db_config['mysql']);

module.exports = {
    redis: redis_client,
    mysql: mysql_pool,
    close: function () {
        redis_client.end();
        mysql_pool.end();
    }
};