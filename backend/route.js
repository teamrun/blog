var logger = require('./base/log');
var config = require('../config');

var BlogAPI = require('./apiController/blogCtrl').BlogAPI;
var CommentAPI = require('./apiController/commentCtrl').CommentAPI;

var pageRoute = require('./pageController');

var apiBaseUrl = config.apiBase,
	pageBaseUrl = config.pageBase;


var apiRouteList = [
/* ------------ BlogAPI的CGUD操作 ------------ */
	{
		action: 'post',
		url: '/blog',
		handler: BlogAPI.create
	},
	{
		action: 'get',
		url: '/blog',
		handler: BlogAPI.getSome
	},
	{
		action: 'get',
		url: '/blog/:id',
		handler: BlogAPI.getById
	},
	{
		action: 'put',
		url: '/blog/:id',
		handler: BlogAPI.updateOne
	},
/* ------------ CommentAPI的 CGUD 操作 ------------ */
	{
		action: 'post',
		url: '/comment',
		handler: CommentAPI.create
	},
    {
        action: 'get',
        url: '/comment',
        handler: CommentAPI.get
    }
];

var pageRouteList = [
	{
		action: 'get',
		url: '/',
		handler: pageRoute.postsList
	},
	{
		action: 'get',
		url: '/posts',
		handler: pageRoute.postsList
	},
	{
		action: 'get',
		url: '/posts/:id',
		handler: pageRoute.thePost
	},
	{
		action: 'get',
		url: '/photos',
		handler: pageRoute.photoGallery
	},
    {
        action: 'get',
        url: '/dashboard',
        handler: pageRoute.dashboard
    }
];


function bindRoute( app ){
	logger.info('server started at:');
	logger.info( (new Date()) );

	logger.debug('api routing >-------->-------->-------->---------');
	bindByRuleSet( app, apiRouteList, apiBaseUrl );
	
	logger.debug('page routing >-------->-------->-------->---------');
	bindByRuleSet( app, pageRouteList, pageBaseUrl );
}

function bindByRuleSet( app, routeRuleSet, baseUrl ){
	var apiCount = routeRuleSet.length;
	for( var i=0; i<apiCount; i++ ){
		var routeIterm = routeRuleSet[i];
		routeIterm.url = baseUrl + routeRuleSet[i].url;
		app[ routeIterm.action ]( routeIterm.url, routeIterm.handler );
		switch( routeIterm.action ){
			case 'get':
				logger.debug( 'GET:       '+ routeIterm.url +'  ->  '+ routeIterm.handler.name );
				break;
			case 'put':
				logger.debug( 'PUT:       '+ routeIterm.url +'  ->  '+ routeIterm.handler.name );
				break;
			case 'post':
				logger.debug( 'POST:      '+ routeIterm.url +'  ->  '+ routeIterm.handler.name );
				break;
			case 'delete':
				logger.debug( 'DELETE:    '+ routeIterm.url +'  ->  '+ routeIterm.handler.name );
				break;
		}
		
	}
	
}


exports.bind = bindRoute;