define(function( require, exports, module ){
	var util = require('./util');
	var $ = util.qs;
	var $A = util.qsa;
	var $ajax = util.ajax;

	var blogCtn = $('.piece');
	window.onload = function(){
		$ajax({
			url: '/app/blog',
			action: 'get',
			data: {key: 'title', value: '使用Q-promise改造回调嵌套的node代码' },
			callback: function( data ){
				if( data || data[0] ){
					blogCtn.innerHTML = data[0].content;
					
					// 渲染ajax获取下来的内容  整个文档重新渲染
					setTimeout( function(){
						Prism.highlightAll();
					}, 300);
				}
			}
		});
	}
});