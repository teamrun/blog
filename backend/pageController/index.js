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

    blogMeta._getThePost( postID, function( err, postModel ){
        if( err ){
           ep.emit('error', err);
        }
        else{
            if( !postModel ){
                render['error/404']( res, {route: 'sendSpecificPost'});
                return false;
            }
            var data = {
                title: postModel.title,
                art: postModel,
                timeFilter: time,
                mdFilter: md
            };

           render.post( res, data );
        }
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
