var path = require('path');
var config = require('../Base/config');
var blogMeta = require('../apiController/blogCtrl').blogMeta;

var viewPath = path.resolve(__dirname, '../../views');
// console.log( '视图文件夹: ' + viewPath );

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
    blogMeta.getThePost( postID, function( postModel ){
        res.render(viewPath+ '/post.ejs', {title: postModel.title, art: postModel} );
    } );
    
}



exports.index = sendPostList;
exports.thePost = sendSpecificPost;