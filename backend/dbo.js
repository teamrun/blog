var mongoose = require('mongoose');

var config = require('./config');


var connect = mongoose.connect('mongodb://localhost/blog');

var blogSchema = mongoose.Schema({
	title: String,
	alia: String,
	content: String,
	summery: String,
	dt_create: Date,
	dt_modify: Array,
	author: String,
	location: Object,
	like: Number,
	comment: Number,
	tag: Array
});

var Blog = mongoose.model('blog', blogSchema);

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
	from: String,
	to: String,
	base: String
	// subcom
});

var Comment = mongoose.model( 'comment', commentSchema );



exports.Blog = Blog;
exports.Comment = Comment;
