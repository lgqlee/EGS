var core_loader = require('./core_loader');
var later = require('later');

var schedParse = function (task_options) {
    var key, sched = later.parse.recur(),
        task_sched_arr = task_options['every'].split(' '),
        unit = {
            hour: sched.hour,
            minute: sched.minute,
            second: sched.second
        }[task_sched_arr[1]];
    if (!unit)throw Error;
    for (key in task_options) {
        if (task_options.hasOwnProperty(key)) {
            switch (key) {
                case 'every':
                    sched.every(Number(task_sched_arr[0]));
                    break;
                case 'after':
                    sched.after(Number(task_options[key]));
                    break;
                case 'before':
                    sched.before(Number(task_options[key]));
                    break;
            }
            unit.call(sched);
        }
    }
    return sched;
};

module.exports.parse = function (app_name, task_obj) {
    if (Object.prototype.toString.call(task_obj).toLowerCase().indexOf('string') !== -1) {
        return core_loader.function_load(app_name,
            core_loader.config.sys['app_tasks_dir'],
            task_obj
        );
    }
    return function () {
        return later.setInterval(task_obj['callback'], schedParse(task_obj));
    };
};