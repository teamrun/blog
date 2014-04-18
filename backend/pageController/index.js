var fs = require('fs');
var path = require('path');

var EventProxy = require('eventproxy');
var jade = require('jade');
var markdown = require( "markdown" ).markdown;

var config = require('../config');
var logger = require('../base/log');
var blogMeta = require('../apiController/blogCtrl').BlogMeta;
var cmtMeta = require('../apiController/commentCtrl').CommentMeta;

var render = require('./render');
var errorHandling = require('./error');


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

function md( str ){
    return markdown.toHTML( str );
}

function sendPostList( req, res ){
    blogMeta._getSome( function( postList ){
        var data = {
            title: 'chenllos的博客',
            posts: postList,
            mdFilter: md
        };
        render.index( res, data);
    });
}

function sendSpecificPost( req, res ){
    var postID = req.param('id');
    var ep = new EventProxy();

    ep.all('blog', 'cmt', function(postModel, cmtList){
        var data = {
            title: postModel.title,
            art: postModel,
            cmtList: cmtList,
            timeFilter: time,
            mdFilter: md
        };

       render.post( res, data );

    });
    ep.bind('error', function(){
        // unbind all callback of event proxy
        ep.unbind();
        render['error/index']( res, {title: '出错了...'} );
    });


    blogMeta._getThePost( postID, function( err, postModel ){
        if( err ){
           ep.emit('error', err);
        }
        else{
            ep.emit('blog', postModel);
        }
    } );
    cmtMeta.getByBlogID( postID, function( cmtRow){
        ep.emit('cmt', cmtRow);
    } );
}

function sendPhotoGallery( req, res ){
    var data = {
        title: 'Photo Gallery'
    };
    render.photo( res, data );
}

function sendDashBoard( req, res ){
    res.sendfile( viewPath + '/dashboard.html');
}




exports.postsList = sendPostList;
exports.thePost = sendSpecificPost;
exports.photoGallery = sendPhotoGallery;

exports.dashboard = sendDashBoard;
