var core_loader = require('./core_loader');
var later = require('later');

// 根据 after before 和 every 参数生成基于later的sched
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

// 根据task的具体内容返回对应的函数
// @param app_name
// @param task_obj
// @return Function
module.exports.parse = function (app_name, task_obj) {
    // 如果是字符串则直接去对应的app中寻找该函数
    if (Object.prototype.toString.call(task_obj).toLowerCase().indexOf('string') !== -1) {
        return core_loader.function_load(app_name,
            core_loader.config.sys['app_tasks_dir'],
            task_obj
        );
    }
    var callback = core_loader.function_load(app_name,
        core_loader.config.sys['app_tasks_dir'],
        task_obj['callback']
    );
    // 使用 later 产生定时任务
    return function () {
        return later.setInterval(callback, schedParse(task_obj));
    };
};