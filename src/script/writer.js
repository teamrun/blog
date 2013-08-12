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
		newBlog = editor.exportFile(newBlog, 'html');

		setTimeout( function(){
			// $('#blogpreview').innerHTML = newBlog;
			$('#blogpreview').innerHTML = util.addSyntaxHighLight( newBlog );

			setTimeout( function(){
				// Prism.highlightElement( $('code')[0] );
				Prism.highlightAll();
			}, 500);
			console.log( newBlog );
		}, 500);
	};

	newBlogBtn.onclick = function(){
		newBlog = editor.exportFile(newBlog, 'html' );
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
					console.log(data );
				}
		})
	};


});