define(function( require, exports, module ){
	var util = require('./util');

	var $ = util.qs;
	var $A = util.qsa;
	var $ajax = util.ajax;

	var exportBtn = $('#export');
	var newBlogBtn = $('#saveblog');
	var newBlog = '';

	exportBtn.onclick = function(){
		// epiceditor的到处函数是一个异步的操作
		newBlog = getNewBlog();
		console.log( newBlog );

		// setTimeout( function(){
			$('#blogpreview').innerHTML = util.addSyntaxHighLight( newBlog );

			setTimeout( function(){
				Prism.highlightAll();
			}, 500);
			console.log( newBlog );
		// }, 500);
	};

	newBlogBtn.onclick = function(){
		// 临时避免导出时undefined的bug，导出两次；
		newBlog = getNewBlog();
		// var titleReg = new RegExp( /<h[\d\D]>[\d\D]+<\/h>[\d\D]> /);

		var title = newBlog.substr( newBlog.indexOf('<h')+4, newBlog.indexOf('</h')-4 );


		var blogObj = {
			title: title,
			content: util.addSyntaxHighLight( newBlog ),
			author: 'chenllos'
		};

		$ajax({
			url: '/app/blog',
			action: 'post',
			data: blogObj,
			callback: function( data ){
					console.log( data );
					if( data.code === 200 ){
						util.showInfo(1, '刚写的博客已经上传好啦~');
					}
					else{
						util.showInfo(0, 'Ooops~ 上传失败了··· code' + data.code );
					}
				}
		})
	};

	function getNewBlog(){
		var newBlog;
		do{
			newBlog = editor.exportFile(newBlog, 'html' );
		}while( newBlog === undefined );

		return newBlog;
	}


});