var path = require('path');
var EventProxy = require('eventproxy');
var ejs = require('ejs');
var markdown = require( "markdown" ).markdown;

var config = require('../Base/config');
var blogMeta = require('../apiController/blogCtrl').BlogMeta;
var cmtMeta = require('../apiController/commentCtrl').CommentMeta;


var viewPath = path.resolve(__dirname, '../../views');
// console.log( '视图文件夹: ' + viewPath );

function doubleDigit( n ){
    if( n < 10 ){
        return String('0' + n);
    }
    return n;
}

ejs.filters.time = function( dateObj ) {
    var d = dateObj;
    var year = d.getFullYear();

    var month = d.getMonth() + 1;

    var date = d.getDate();
    var h = d.getHours();
    var m = d.getMinutes();
    return year + '-' + doubleDigit(month) +'-' + doubleDigit(date) + ' ' + doubleDigit(h) + ':' + doubleDigit(m);
};
ejs.filters.md = function( str ){
    return markdown.toHTML( str );
};

function sendPostList( req, res ){
    blogMeta._getSome( function( postList ){
        res.render( viewPath+ '/index.ejs', {
            title: 'chenllos的博客',
            posts: postList
        });
    });
}

function sendSpecificPost( req, res ){
    var postID = req.param('id');
    var ep = new EventProxy();

    ep.all('blog', 'cmt', function(postModel, cmtList){
        res.render(viewPath+ '/post.ejs', {title: postModel.title, art: postModel, cmtList: cmtList} );
    });


    blogMeta._getThePost( postID, function( postModel ){
        ep.emit('blog', postModel);
    } );
    cmtMeta.getByBlogID( postID, function( cmtRow){
        ep.emit('cmt', cmtRow);
    } );
}

function sendDashBoard( req, res ){
    res.sendfile( viewPath + '/dashboard.html');
}




exports.postsList = sendPostList;
exports.thePost = sendSpecificPost;

exports.dashboard = sendDashBoard;