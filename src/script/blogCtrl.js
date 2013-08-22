define(function( require, exports, module ){

    var util = require('./util');
    var Config = require('./config');



    var $ajax = util.ajax;


    var Blog = {};
    Blog.get = function( key, val, callback ){

        var reqParam = {
            key: key,
            value: val
        };

        $ajax( {
            url: Config.getBlogUrl,
            action: 'get',
            data: reqParam,
            callback: callback
        });
        return false;
    };


    module.exports = Blog;

});