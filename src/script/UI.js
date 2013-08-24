define(function(require, exports, module){
    var util = require('./util');
    var Blog = require('./BlogCtrl');




    var $ = util.qs;
    var $A = util.qsa;

    var UI = {};
    var BlogArea = $('section');


    UI.renderBlog = function( data ){
        if( data && data[0] && data[0].content ){
            document.body.className = 'readmode';
            if( $('article.piece[data-_id="'+ data[0]._id+ '"]') ){

            }
            else{
                var tmpBlog = new Blog(data[0]);

                BlogArea.innerHTML += '<article class="piece" data-_id="' + tmpBlog._id + '">' + tmpBlog.renderContent() + '</article>';

                Prism.highlightAll();
            }
        }
    };




    module.exports = UI;

});