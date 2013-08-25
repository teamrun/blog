define(function(require, exports, module){
    var Util = require('./util');
    var Blog = require('./BlogCtrl');




    var $ = Util.qs;
    var $A = Util.qsa;

    var UI = {};
    var BlogArea = $('section #blogCtn');


    UI.deliverBlog = function( data ){
        // 尽快引入DomCached机制
        if( data && data[0] && data[0].content ){
            // 切换至阅读模式
            document.body.className = 'readmode';
            var curReading = $('.piece.reading');

            if( curReading && curReading.dataset['_id'] == data[0]._id){
                // 如果在读这一篇,不做操作
            }
            else{
                // 如果未在读
                var tmpBlog = new Blog(data[0]);

                BlogArea.innerHTML += '<article class="piece wait2come" data-_id="' + tmpBlog._id + '">' + tmpBlog.renderContent() + '</article>';

                Prism.highlightAll();

                if( curReading ){
                    console.log( curReading.className );
                    // Util.replaceClass(curReading,'reading', 'go');
                   Util.replaceClass($('.piece.reading'),'reading', 'go');
                    console.log( curReading.className );
                }

                var nextReading =  $('article.piece.wait2come');

                setTimeout(function(){

                    Util.replaceClass(nextReading, 'wait2come', 'reading');
                },300);

            }
        }
    };




    module.exports = UI;

});