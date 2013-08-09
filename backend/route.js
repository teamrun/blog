
var config = require('./config');


var Blog = require('./blogCtrl.js');
var Comment = require('./commentCtrl.js');

var baseUrl = '/app';

var routeList = [
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