define(function(require, exports, module){
    var Util = require('./util');
    var Blog = require('./BlogCtrl');
    var helper = require('./helper');



    var $ = Util.qs;
    var $A = Util.qsa;

    var UI = {};
    var BlogArea = $('section #blogCtn');


    UI.deliverBlog = function( data ){
        // 尽快引入DomCached机制
        if( data && data[0] && data[0]._id ){
            // 切换至阅读模式
            document.body.className = 'readmode';
            var curReading = $('.piece.reading');

            
            // 如果有在读
            if( curReading ){
                if( curReading.dataset['_id'] == data[0]._id ){
                    // 如果在读的就是读者想要看的  那么什么也不做
                    return false;
                }
                else{
                    // 如果不是, 
                    // 隐藏在读,
                    Util.replaceClass($('.piece.reading'),'reading', 'go');
                    // 检查是否已经加载
                    var selector = '.piece[data-_id="' + data[0]._id+ '"]';
                    if( helper.isDomCached( selector ) ){
                        // 显示缓存的
                        Util.replaceClass( $( selector ), 'go','reading');
                    }
                    else{
                        // 或者加载新的
                        addNewBlog( data[0] );
                    }
                }
            }
            else{
                // 如果没有,
                // 添加新的
                addNewBlog( data[0] );
            }
            
        }
        else{
            // blog未获取到  或 不存在
        }
        return false;
    };


    function addNewBlog( blogData ){
        var tmpBlog = new Blog( blogData );

        BlogArea.innerHTML += '<article class="piece wait2come" data-_id="' + tmpBlog._id + '">' + tmpBlog.renderContent() + '</article>';
        Prism.highlightAll();
        var nextReading =  $('article.piece.wait2come');
        setTimeout(function(){
            Util.replaceClass(nextReading, 'wait2come', 'reading');
        },300);
    }




    module.exports = UI;

});