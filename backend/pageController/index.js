var path = require('path');
var EventProxy = require('eventproxy');
var markdown = require( "markdown" ).markdown;

var config = require('../config');
var logger = require('../base/log');
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

function time( dateObj ) {
    var d = dateObj;
    var year = d.getFullYear();

    var month = d.getMonth() + 1;

    var date = d.getDate();
    var h = d.getHours();
    var m = d.getMinutes();
    return year + '-' + doubleDigit(month) +'-' + doubleDigit(date) + ' ' + doubleDigit(h) + ':' + doubleDigit(m);
}
function md2html( str ){
    return markdown.toHTML( str );
}

function sendPostList( req, res ){
    blogMeta._getSome( function( postList ){
        res.render( 'index', {
            title: 'chenllos的博客',
            posts: postList,
            mdFilter: md2html
        });
    });
    // res.render('index', { title: 'Chenllos' });
}

function sendSpecificPost( req, res ){
    var postID = req.param('id');
    var ep = new EventProxy();

    ep.all('blog', 'cmt', function(postModel, cmtList){
        res.render('post', {
            title: postModel.title,
            art: postModel,
            cmtList: cmtList,
            mdFilter: md2html,
            timeFilter: time
        } );
    });


    blogMeta._getThePost( postID, function( postModel ){
        ep.emit('blog', postModel);
    } );
    cmtMeta.getByBlogID( postID, function( cmtRow){
        ep.emit('cmt', cmtRow);
    } );
}

function sendPhotoGallery( req, res ){
    res.render( 'photo', {
        title: 'Photo Gallery'
    } );
}

function sendDashBoard( req, res ){
    res.sendfile( viewPath + '/dashboard.html');
}




exports.postsList = sendPostList;
exports.thePost = sendSpecificPost;
exports.photoGallery = sendPhotoGallery;

exports.dashboard = sendDashBoard;