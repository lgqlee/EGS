## 前言

`我们不去制造万能的钥匙`

不支持情景列表：

1. 过度依赖关系型数据库，且存在复杂查询
2. 路由简单且数量较少（EGS会增加项目的复杂度）
3. 不喜欢 `redis`
4. 需要使用模板、session

return false;

- - -

最佳使用场景：

1. 整体可以使用 `nosql` 设计实现，所有数据直接操作 redis（异步数据永久化）
2. 仅提供无状态的接口
3. 存在子应用的概念，且子应用间互相完全独立（例如独立活动的接口）
4. 子应用需要独立依赖管理，无缝上下线、上线初始化操作、定时任务操作、下线后 `redis` 清理工作 

## 开始

运行环境：

1. 需要提前安装好 `Mysql` 以及 `Redis`。生产环境中需要提前安装好 hiredis

		npm install hiredis redis

2. 全局安装 npm 包

		npm install egserver -g

3. 项目目录初始化

		mkdir egame
		cd egame
		egs create
		npm install
	
	该操作会在当前目录下生成需要的所有文件

4. 修改数据库配置文件至可用状态
	
		config/database.json

5. 生成 app，其中第二个参数为 app 名称

		egs generate demo
		该命令会在 apps 文件夹中生成 app 需要的文件

6. 开发环境运行

		npm start

	访问 `localhost:3000`

## 配置详情

### 系统配置

1. 数据库配置

		config/database.json

2. 系统参数配置

		config/sys.json
	
	该文件主要来配置部分系统参数。

		"global_route_namespace" 全局默认的 URL 前缀，例如所有请求中都来自 /ajax/xx 可以在这里添加 "ajax"，设为 false 禁用该功能。
	    "redis_persist_key" Redis 中用于数据持久化的 List 对应的KEY。
	    "db_prefix" 全局数据库表名/Redis 中的key 的前缀

### App 配置

app 的配置都在 apps/#{app_name}/config 中存放

1. 依赖关系配置
	
		requirements.json

	以列表的格式将所依赖的包在其中列出。例如： ["request"]。使用命令即可以安装该依赖。

		egs install #{app_name}

2. 路由配置

		routes.json

	示例：
		
		{
		    "namespace": "demo",
		    "routes": {
		        "get /hello": "hello#world"
		    }
		}

	每个 App 的路由也存在 namespace 配置，用于区分每个 app 的 url。如果全局 namespace设置为 ajax ，同时该 app 中设置为 demo，那么该 app 下所有的 URL 都会被加上 /ajax/demo。
	
	routes 中存放 URL 请求规则与执行方法的对应关系，Key 为 "#{method} #{url}"，Value 为 "#{controller_name}##{action}"，例如如下：
		
		"get /hello": "user#hello"

	该语句的结果就是当 GET /ajax/demo/hello 这个 url 的时候，会去调用 controllers 下面的 user_controller.js 里面的 exports.hello 方法。

	其中 method 的支持以及 url 支持的模式，以及 hello 的写法参照 Express[[http://expressjs.com/4x/api.html](http://expressjs.com/4x/api.html)]

	简单的 user_controller.js 例子如下：

		module.exports.hello = function (req, res) {
		    res.send('hello world');
		};

3. 任务配置

	tasks.json

	示例：
	
		{
		    "init": [
		        "hello#world"
		    ],
		    "timer": [
		        {
		            "every": "3 second",
		            "after": 0,
		            "before": 10,
		            "fn": "hello#world"
		        }
		    ]
		}

	任务分为初始任务以及定时任务。分别对应 init 和 timer。

	\# 初始化任务 #："init" 所对应的列表，例如 "hello#world" 对应的是 tasks 文件夹下面的 hello 方法中的 exports.world 方法。

	运行方式：

		egs init #{app_name}
	
	这会以此执行所有的初始化任务。
	
	\# 定时任务 #："timer" 所对应的列表，该功能通过 later.js[[http://bunkat.github.io/later/](http://bunkat.github.io/later/)] 实现。配置中每个 HASH 结构的意义如下：

	1. every：必填参数。任务执行的间隔，其中单位支持 hour，minute, second目前。
	2. after: 可选参数。示例中的 0 表示从每分钟的 0 second 开始计算。
	3. before：可选参数。示例中的 10 表示每分钟到 10 second 停止计时。
	4. fn：必填参数。执行的方法。示例中 "hello#world" 对应的是 tasks 文件夹下面的 hello 方法中的 exports.world 方法。

	运行方式

		egs timer #{app_name}

	示例中的代码会在每分钟的 0s，3s，6s，9s执行。

## Model 使用（尚未完成，暂不可用）	

### Model 定义

	var Model = require('egserver').Model;

	var User = Model.extend('user', {
		name: 'String#randomString',
		age: 'Int',
		sex: 'String:female',
		create_at: 'DateTime#now'
	}[, options])

	User.verify.age = function(age){
		return age > 0;
	};

	User.fn.randomString = function(){
	
	};

Model.extend 有三个参数，第一个为当前 model 的名称，第二个为字段声明，是三个可选，为一些设置。

字段说明的 key 为对应的字段，value 的格式为 类型#初始方法，或者 类型:初始值，当新实例化一个对象的时候，会根据用户输入的参数、默认值、默认方法的顺序进行查找（两者不能同时存在）。如果是初始方法的话，默认会使用 NewModel.fn[fn]中的方法的值作为默认值。

示例中的 name 会在 create 时调用 User.fn.randomString 的返回值作为默认。sex 字段会使用 female 作为默认值。

有一个特殊情况是 DateTime 和 Date，原生支持 now 方法，即当前时间（关于时间操作参考 Momentjs[[http://momentjs.com/](http://momentjs.com/)]）。
	
其中类型支持有：

1. Boolean
2. String
3. Int
4. Float
5. DateTime
6. Date

options 参数为可选内容，支持的属性有（[]里面的为默认值）：

1. mysql_only[false] 只使用 mysql 进行操作
2. redis_only[false] 只使用 redis 进行操作
3. ignore_id[false] 不自动添加 id
4. expire[false] redis 的过期时间，false 则不设过期
5. db_name[''] 强制指定 Mysql 表名
6. redis_prefix[''] 强制使用 Redis 的 key 前缀

### Model 查询

1. find

		NewModel.find(model_id, function (model_obj) {})

	find 在任何模式下都可以使用，但是在 mysql_only 或者 redis 设置过期时间 的模式下可能存在一定的数据错误率，回调中 model_obj 为 model 的实例对象。

2. where

		NewModel.where(querys, function (model_objs) {}[, limit])

	where 在 redis_only 模式下不能使用。querys 为具体的查询条件，回调函数中的 model_objs 为列表，limit为条数限制。

	/# querys #：支持等于、大于[gt]、小于[lt]、不等于[not_eql]以及Like[like]查询，示例如下：

		{
			age: {gt: 15, lt: 30, not_eql: 20},
			sex: 'female'
		}

	这段查询的意思是 年龄大于15且小于30且不等于20，且性别为female 的所有用户对象。

	/# limit #：支持数字和列表，数字的话则表示取最新的 n 条数据，否则如果是列表，例如 [5, 10]，表示第 6 到第 10 条数据。

### Model 实例操作

1. 新建：

		var vt = User.create({
			name: 'Vincent Ting',
			age: -4
		}, function(errs, user_obj){
			// do something
		})
	
	其中第一个参数为每个字段的值，回调中 errs 为验证结果，为 list，例如本例中由于 age 不满足 > 0 的要求，这里 errs 的值会为 ['age']。

2. 更新

		vt.age += 15;

	通过普通的赋值语句即可实现对属性的直接修改。
	
3. 保存
	
		vt.saveRedis(function (errs, user_obj){})
		vt.saveDB(function (errs, user_obj){})
		vt.save(function (errs, user_obj){})

	三种更新方式，其中 saveRedis 在 mysql_only 的模式下会报错，saveDB会在 redis_only 的情况下报错。如果非特殊情况，使用 save方法既可以。 errs 的返回值与 create 相同。

	更新只会去更新修改过的字段。

4. 销毁

		vt.destroyRedis(function (){})
		vt.destroyDB(function (){})
		vt.destroy(function (){})

	删除以及针对特定存储方式的删除。

5. redis 的原子增

	### 高并发下重要操作

	该类操作只能针对 float 或者 int 字段，利用了redis原子性操作，保证了数据的正确性。

		vt.incrBy('age', 11, function (age){})
	
	这里会把 age 增加 11，回调中的 age 为更改后的 age 值。

	incrFloatBy 与该方法类似，但是只针对 Float 类型的字段。

## 其他

### 队列模型

### 单例模型

## 如何进行测试

少安毋躁

## 发布与管理

少安毋躁

## TODO

1. ORM 的 relation（redis 手动索引）
2. 自动建表命令以及活动下线后的缓存清理
3. 使用 gaze 实现开发环境中的修改后自动重启