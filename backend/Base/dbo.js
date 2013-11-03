 var mongoose = require('mongoose');

var config = require('./config');


var Blog, Comment;

// var child = require('child_process'),
// 	exec = child.exec;
// 必须使用同步方法,因为exports方法必须在最外面执行,不能被包裹在{}中,而且导出的对象也是
// exec('mongo', function(err, stdout, stderr){
// 	if( stderr ){
// 		startMongod();
// 	}
// 	else{
// 		// initDB();
// 	}
// });

// function startMongod(){
// 	exec('mongod', function(err, stdout, stderr){
// 		if( !err && !stderr ){
// 			// initDB();
// 		}
// 	} );
// }

// sleep( 2000 );
// function initDB(){
	
	var connect = mongoose.connect('mongodb://localhost/blog');
	var blogSchema = mongoose.Schema({
		title: String,
		alia: String,
		content: String,
		summery: Object,
		dt_create: Date,
		dt_modify: Array,
		author: String,
		location: Object,
		like: Number,
		comment: Number,
		tag: Array
	});

	Blog = mongoose.model('blog', blogSchema);

	var firstBlog = new Blog({
		title: '搭建自己的博客',
		content: '还在想',
		dt_create: new Date(),
		dt_modify: [ new Date() ],
		author: 'chenllos',
		location: null,
		like: 0,
		comment: 0,
		tag: ['tech']
	});
	// firstBlog.save();

	// 标题，内容，评论人，评论谁， 基于哪篇文章
	var commentSchema = mongoose.Schema({
		title: String,
		content: String,
		dt_create: String,
		from: String,
		to: String,
		base_article: String,
		base_cmt: String
		// subcom
	});

	Comment = mongoose.model( 'comment', commentSchema );

// }

// setTimeout()


console.log( Blog );


function sleep( ms ){
	var starter = Date.now();
	while(true){
		if( Date.now() - starter > ms ){
			break;
		}
	}

	return false;
}

exports.Blog = Blog;
exports.Comment = Comment;