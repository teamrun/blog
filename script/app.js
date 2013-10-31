define(function( require, exports, module ){
	var util = require('./util'),
		tools = require('./basetool'),
		config = require('./config'),
		// Timeline = require('./Timeline.js').Timeline,
		Router = require('./route.js');

	var Widget = require('./widgetCtrl.js');


	var $ = util.qs,
		$A = util.qsa,
		$ajax = util.ajax;

	var lineObj, itermCtnObj;
	var ids = {
		line: 'line',
		itermCtn: 'itermCtn'
	};

	// 构建路由规则
	var rules = [
		{
			path: '/read',
			handler: function(){
				document.body.className = 'readmode';
			}
		}
	];

	// 嗯 可以用单例模式,  然后提供一个"更新路由规则"的方法,在app.js中通过"更新路由规则",将定义好的方法导入进去
	// 这样就不用依赖来依赖去了...
	// 我还是天才啊~~

	var router = new Router(function( pathname ){
		// UI 操作
		var H;
		if( pathname.indexOf('/read') >=0 ){
			document.body.className = 'readmode';
			H = tools.layoutSingal();
		}
		else{
			H =tools.layoutTwo();
		}
		H = Math.ceil(H + 30);
		lineObj.style.height = H + 'px';
		itermCtnObj.style.height = H  + 'px';

		// 数据操作: ajax获取什么的....

	});
	
	window.onload = function(){
		
	};

	var blogListVM, cmtVM;
	avalon.ready(function(){
		blogListVM = avalon.define('blogList', function(vm){
			vm.list = [];
			vm.enterReadMode = function(e){
				// 想办法实现jquery的closest方法,方便这样的代理
				var id= e.target.dataset.blogid;
				console.log( id );

				router.go( null, null, '/read/art/' + id );
			}
		});

		avalon.scan( $('#timeline'), 'blogList' );
		// 下面的代码不必等到onload...
		initFunc();
		// 尝试给自己的$ajax方法添加 类似jquery的 fianl方法  并抛出http状态码...
		$ajax({
			url: config.getBlogUrl,
			action: 'get',
			// data: {key: '_id', value: '52104667f084e7b304000002' },
			callback: function( data ){
				if( data || data[0] ){
					// 使用markdown.js渲染blog 或 缩略图
					blogListVM.list = data;

					router.route( location.pathname );
				}
			}
		});
	});

	function initFunc(){
		lineObj = $('#'+ids.line);
		itermCtnObj = $('#'+ids.itermCtn);
	}

	window.GR = router;
});