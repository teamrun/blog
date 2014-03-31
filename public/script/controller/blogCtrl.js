define(function( require, exports, module ){

    var comment = require('../view/blog/comment');
    comment.init();

    var postList = require('../view/blog/pageInit');
    postList.init();

    var imgView = require( '../view/blog/imgView' );
    imgView.init();

});