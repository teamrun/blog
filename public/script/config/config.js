define( function( require, exports, module ){
    var baseUrl = '/app';
    var api = {
        newPost: '/blog'
    };

    for( var i in api ){
        api[i] = baseUrl + api[i];
    }

    var config = {
        api: api
    };

    module.exports = config;
} );
