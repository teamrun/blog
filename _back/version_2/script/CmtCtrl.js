define(function(require, exports, module){

    var util = require('./util');
    var helper = require('./helper');
    var Config = require('./config');

    var $ = util.qs;
    var $A = util.qsa;
    var $ajax = util.ajax;

    var Comment = {};
    Comment.new = function( param, cb ){
        param.dt_create = new Date();
        $ajax({
            url: Config.newCommentUrl,
            action: 'post',
            data: param,
            callback: function( data ){
                if( data.code === 200 ){
                    cb( data );
                }
                else{
                    alert('newComment error!');
                }
            }
        });
    };

    Comment.get = function( blogid, cb ){
        $ajax({
            url: Config.getCommentUrl,
            action: 'get',
            data: { blog_id: blogid },
            callback: function( data ){
                if( data.code === 200 ){
                    cb( data );
                }
                else{
                    alert('newComment error!');
                }
            }
        });
    }

    module.exports = Comment;

    
});