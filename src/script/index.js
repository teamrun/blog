define(function( require, exports, module ){
	var util = require('./util');
	var tools = require('./blogtool');
	var config = require('./config');
	var Timeline = require('./Timeline.js').Timeline;

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

					// 渲染ajax获取下来的内容  整个文档重新渲染
					// setTimeout( function(){
					// 	Prism.highlightAll();
					// }, 300);
				}
			}
		});
	}

	// var mdStr = '##书签栏小工具的编写 and “剪客工具”的原理\n\n###书签栏小工具\n书签小工具（Bookmarklets）是一个非常棒的javascript代码小片断伪装成的小应用，它驻留在你的浏览器里并为网页提供额外的功能。\n下面介绍如何写一个书签栏小工具，以及如何扩展。\n>书签栏小工具其实就是超链接\n\n通过查找资料可以发';

	// var data = [{}];
	// data[0].summery = {
	// 	text: mdStr,
	// 	img: ''
	// };

	// data.push( data[0] );
	// data.push( data[0] );
	// data.push( data[0] );

	function patchStyle(){
		var headerNode = $('header');
		var timelineNode = $('#timeline');

		headerNodeW = window.getComputedStyle( headerNode ).width;

		// timelineNode.style.width = ( document.body.clientWidth - Number( headerNodeW.substr(0, headerNodeW.length-2) ) ) + 'px';
		// setTimeout( function(){
		// 	timelineNode.style.visibility = 'visible';
		// }, 305);
	}

});