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

	// 构建路由规则
	var rules = {

	};

	var router = new Router(function( pathname ){
		console.log( 'routing to... :' + pathname );
	});

	window.onload = function(){
		$ajax({
			url: config.getBlogUrl,
			action: 'get',
			// data: {key: '_id', value: '52104667f084e7b304000002' },
			callback: function( data ){
				if( data || data[0] ){
					// 使用markdown.js渲染blog 或 缩略图
					blogListVM.list = data;

					var opt = {
						targetSelector: '#main #itermCtn' + ' .iterm.raw',
						// refSelector: '',
						classDef: true,
						class1: 'left',
						class2: 'right',
						class1B: 0,
						class2B: 40,
						defaultMargin: 40,
						class2repalce: 'raw'
					};
					console.log( opt );

					tools.posDom( opt );
				}
			}
		});
	};

	var blogListVM, cmtVM;
	avalon.ready(function(){
		blogListVM = avalon.define('blogList', function(vm){
			vm.list = [];
			vm.enterReadMode = function(e){
				var id= e.target.dataset.blogid;
				console.log( id );

				router.go( null, null, '/read/art/' + id );
			}
		});

		avalon.scan( $('#timeline'), 'blogList' );
	});
});

/*
define(function( require, exports, module ){
	var util = require('./util');
	var tools = require('./blogtool');
	var config = require('./config');
	var Timeline = require('./Timeline.js').Timeline;
	var his = require('./route.js');

	var Widget = require('./widgetCtrl.js');

	var $ = util.qs;
	var $A = util.qsa;
	var $ajax = util.ajax;

	var blogCtn = $('.piece');
	window.onload = function(){

		patchStyle();

		var blogDataSet;

		$ajax({
			url: config.getBlogUrl,
			action: 'get',
			// data: {key: '_id', value: '52104667f084e7b304000002' },
			callback: function( data ){
				if( data || data[0] ){
					// 使用markdown.js渲染blog 或 缩略图
					blogDataSet = data;


					var option = {
						itermCtn: config.timeline.itermCtn,
						sideFirst: config.timeline.sideFirst,
						itermConstructor: tools.itermConstructor,
						data: blogDataSet,
					};

					var timeline = new Timeline( option );

					timeline.init();

					timeline.bind();
				}
			}
		});
	}

	function patchStyle(){
		var headerNode = $('header');
		var timelineNode = $('#timeline');

		headerNodeW = window.getComputedStyle( headerNode ).width;
	}

});

*/