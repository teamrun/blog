define(function( require, exports, module ){
    var config = {
        getBlogUrl: '/blog',
        newBlogUrl: '/blog',
        newCommit: '/commit'
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