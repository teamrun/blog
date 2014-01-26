define(function( require, exports, module ){
    var config = {
        newBlogUrl: '/blog',
        getBlogUrl: '/blog',
        newCommentUrl: '/comment',
        getCommentUrl: '/comment'
    };

    for( var i in config ){
        config[i] = '/app' + config[i];
    }

    config.timeline = {
        itermCtn: '#itermCtn',
        sideFirst: 'left'
    };

    module.exports = config;
});