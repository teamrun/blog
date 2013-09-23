
var config = require('./Base/config');


var Blog = require('./Ctrl/blogCtrl.js');
var Comment = require('./Ctrl/commentCtrl.js');

var baseUrl = '/app';

var routeList = [
//    Blog的CGUD操作
	{
		action: 'post',
		url: '/blog',
		handler: Blog.create
	},
	{
		action: 'get',
		url: '/blog',
		handler: Blog.getSome
	},
	{
		action: 'get',
		url: '/blog/:id',
		handler: Blog.getById
	},
	{
		action: 'put',
		url: '/blog/:id',
		handler: Blog.updateOne
	},
//     Comment的 CGUD 操作
	{
		action: 'post',
		url: '/comment',
		handler: Comment.create
	},
    {
        action: 'get',
        url: '/comment',
        handler: Comment.get
    }
];


function bindRoute( app ){
	for( var i in routeList ){
		var routeIterm = routeList[i];
		
		routeIterm.url = baseUrl + routeList[i].url;

		app[ routeIterm.action ]( routeIterm.url, routeIterm.handler );

		console.log( routeIterm.action +' -|- '+ routeIterm.url +' -|- '+ routeIterm.handler.name );
	}
}



exports.bind = bindRoute;