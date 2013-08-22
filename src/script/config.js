define(function( require, exports, module ){
    var config = {
        getBlogUrl: '/blog',
        newBlogUrl: '/blog',
        newCommit: '/commit'
    };

    for( var i in config ){
        config[i] = '/app' + config[i];
    }

    module.exports = config;
});