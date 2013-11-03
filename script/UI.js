define(function(require, exports, module){
    var Util = require('./util');
    var Blog = require('./BlogCtrl');
    var helper = require('./helper');



    var $ = Util.qs;
    var $A = Util.qsa;

    var UI = {};
    var BlogArea = $('#read #blogCtn');

    UI.renderBlog = function( blogObj, vmVar, readObj ){
        vmVar.blog = blogObj.content;
        vmVar.blogID = blogObj._id;

        // 滚动到顶部,方便用户从头开始读
        readObj.scrollTop = 0;

        setTimeout(function(){
            highLight(BlogArea);
        }, 100);
    };
    UI.renderComment = function( cmtList, vmVar ){
        vmVar.cmtlist = cmtList;
    };

    function highLight( ele ){
        // console.log( ele );
        // Prism.highlightElement( ele, true, function(){} );
        Prism.highlightAll();
    }



    module.exports = UI;

});