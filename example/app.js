var egs = require('../index');

egs.start(function () {
    console.log('Server is running at port: ' + this.get('port'));
});