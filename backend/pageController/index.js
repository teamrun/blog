var fs = require('fs');
var path = require('path');

var EventProxy = require('eventproxy');
var jade = require('jade');
// new nd parser, based on showdown
var md2html = require( "node-markdown" ).Markdown;
// old nd parser
// var md2html = require( "markdown" ).markdown.toHTML;

var config = require('../../config');
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
    return md2html( str );
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

function sendSpecificPost( req, res, next ){
    var postID = req.param('id');

    blogMeta._getThePost( postID, function( err, postModel ){
        if( err ){
           next( err );
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



function sendDashBoard( req, res ){
    render.dashboard( res, {});
}

var ErrorPage = {
    404: function(req, res){
        render[404](res, {});
    },
    500: function(req, res){
        render[500](res, {});
    }
}


var PhotoPageCtrl = require('./photo')



exports.postsList = sendPostList;
exports.thePost = sendSpecificPost;

exports.Photo = PhotoPageCtrl;

exports.dashboard = sendDashBoard;

exports['404'] = ErrorPage[404];
exports['500'] = ErrorPage[500];
