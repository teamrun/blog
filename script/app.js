define(function( require, exports, module ){
	var util = require('./util'),
		tools = require('./basetool'),
		config = require('./config'),
		// Timeline = require('./Timeline.js').Timeline,
		Router = require('./route.js'),
		Blog = require('./BlogCtrl'),
		Comment = require('./CmtCtrl'),
		UI = require('./UI');

	var Widget = require('./widgetCtrl.js');


	var $ = util.qs,
		$A = util.qsa,
		$ajax = util.ajax;

	var itermCtnObj, readObj, cmtTextObj, newCmtBtnObj, nicknameObj, emailObj;
	var ids = {
		read: 'read',
		itermCtn: 'itermCtn',
		cmtText: 'write-cmt',
		newCmtBtn: 'newcmt-btn',
		nickname: 'nickname',
		email: 'email'
	};
    // TODO: 如何实现nodejs式的路由规则? 还有啊 感觉用title查询更好啊`` english title  允许在writer页设置~
    // TODO: 文件模块和分离  VM应该单独列出来?
    //      要解决的问题: 怎么很好的实现有序有层次的文件依赖, 函数调用...
    // TODO: loading
    // TODO: 手动状态切换( 允许为全屏~  )
    // TODO: 内存中的缓存
    // TODO: UI, 图标, homepage, about me
    // TODO: 更丰富的blog信息... type like数, cmt数...

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

			// 数据操作: 获取特定的文档
			// 获取id 容错处理...
			// 怎样实现node中的类似 /:id的参数方法呢...
			var id = pathname.match(/\/[0-9a-zA-Z]{24}/);
			id = id[0].substr(1, 24);
			Blog.get('_id', id, function( data ){
				console.log( '获取了特定为blog: ');
				console.log( data );
				// 获取的是单个 所以必须有值才算成功
				if( data[0] ){
					console.log( data[0] );
					// blogVM.blog = data[0];
					UI.renderBlog( data[0], blogVM, readObj );
				}
			});
			Comment.get( id, function( data){
				console.log('获取了blog:' + id + ' 的评论们:');
				console.log( data );
				// 获取列表  如果为长度为0 即为没有评论 是正常数据
				if( data.code === 200 ){
					UI.renderComment( data.comments, cmtVM );
				}
			} );
		}
		else{
			document.body.className = 'glancemode';
			H =tools.layoutTwo();
		}
		H = Math.ceil(H + 30);
		itermCtnObj.style.height = H  + 'px';
		// 获取缩略列表
	});
	
	window.onload = function(){
		
	};

	var blogListVM, blogVM, cmtVM;
	avalon.ready(function(){
		blogListVM = avalon.define('blogList', function(vm){
			vm.list = [];
			vm.enterReadMode = function(e){
				// 想办法实现jquery的closest方法,方便这样的代理
				var id= e.target.dataset.blogid;
				console.log( id );

				router.go( null, null, '/read/art/' + id );
			};
		});

		blogVM = avalon.define('blog', function(vm){
			vm.blog = '';
			vm.blogID = '';
			vm.blogshow = false;

			vm.$watch('blog', function( newVal ,oldVal ){
				// vm.blogshow = util.objNotEmpty( newVal );
				vm.blogshow = Boolean(newVal.length);
			});
		});

		cmtVM = avalon.define('comment', function(vm){
			vm.cmtlist = [];
			vm.count = 0;
			vm.tipshow = false;
			vm.newCmt = function( e ){
				// new func from cmtCtrl
				var reqParam = {
					title: '',
					content: cmtTextObj.value,
					from: nicknameObj.value,
					email: emailObj.value,
					// to: '',
					base_article: util.dataset( readObj, 'blogid' ),
					// base_cmt: ''
				};
				vm.cmtlist.push( reqParam );
				Comment.new( reqParam, function( data ){
					console.log( '评论提交成功~!' );
					vm.cmtlist[ vm.cmtlist.length-1 ]._id = data.comment_id;
					vm.tipshow = true;
					setTimeout(function(){
						vm.tipshow = false;
					}, 3000);
				} );
			};

			vm.$watch('cmtlist', function( newVal, oblVal ){
				// 新建评论时会发生两次值的变化
				// 		第一次时  是假的成功,只是将用户输入添加到评论列表, 此时的新加的值是没有id的
				// 		所以...  添加评论数 和 显示提示 只需发生一次...
				// 		至于哪一次提示 哪一次+1 ....
				// 		应该将显示tip的操作放在新建处!
				vm.count = newVal.length;
			});
		});

		avalon.scan( $('#timeline'), 'blogList' );
		avalon.scan( $('#read'), 'blog' );
		avalon.scan( $('#read'), 'comment' );
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
		itermCtnObj  = $('#' + ids.itermCtn);
		readObj      = $('#' + ids.read );
		cmtTextObj   = $('#' + ids.cmtText );
		newCmtBtnObj = $('#' + ids.newCmtBtn );
		nicknameObj  = $('#' + ids.nickname );
		emailObj     = $('#' + ids.email );
	}

	window.GR = router;
});