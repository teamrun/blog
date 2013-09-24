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
            if( document.body.className !== 'readmode' ){
                document.body.className = 'readmode';
                setTimeout( function(){
                    var option = {
                        classMatters: false,
                        allItermSelector: 'aside#timeline ul#itermCtn .iterm',
                        allItermBeforeSelector: '',
                        // allItermBeforeSelector: 'aside#timeline ul#itermCtn .iterm:not(.raw)',
                        defaultMargin: 25
                    };
                    reCacul( option );
                }, 300);
            }

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

    UI.switchStatus = function(){
        if( document.body.className == 'readmode' ){

        }
        else{
            document.body.className = 'readmode';
        }
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



    function reCacul( option ){
        // var iterms = $A( option.itermCtnSelector + ' .iterm.raw');
        var iterms = $A( option.allItermSelector);
        var itermCount = iterms.length;
        if( option.classMatters  ){
            var class2add;
            for( var j=0; j< itermCount; j++ ){
                if( thisClass.leftBottom >= this.rightBottom ){
                    class2add = 'right';
                }
                else{
                    class2add = 'left';
                }
                // 添加合适的类,添加定位数据
                // util.replaceClass( iterms[j], 'raw', class2add );
                iterms[j].className = iterms[j].className.replace( 'raw', class2add );
                iterms[j].style.top = thisClass[ class2add + 'Bottom' ] + 'px';
                // console.group();

                // console.log( 'now positioning for: ' + j );
                // console.log('it will be posed at: ' + thisClass[ class2add+'Bottom' ] );

                // 为下一次循环做准备
                var curItermHeight = window.getComputedStyle( iterms[j] ).height;
                curItermHeight = curItermHeight.substr( 0, curItermHeight.length-2 );
                // console.log( j+'\'s height is: ' + curItermHeight);

                thisClass[ class2add+'Bottom' ] += Number( curItermHeight ) + Number( thisClass.defaultMargin );
                // console.log( thisClass[ class2add+'Bottom' ] );
                // console.groupEnd();
            }
        }
        else{
            var totalHeight = 0;
            if( option.allItermBeforeSelector ){
                var allItermsBefore = $A( option.allItermBeforeSelector);
                var lastItermBefore = lItermsBefore[ allItermsBefore.length-1 ];

                var lastTop = lastItermBefore.style.top;
                lastTop = Number( lastTop.substr(0, lastTop.length-2) );
                var lastHeight = window.getComputedStyle( lastItermBefore ).height;
                lastHeight = Number( lastHeight.substr(0, lastHeight.length-2) );

                totalHeight = lastTop + lastHeight + option.defaultMargin;
            }


            for( var j=0; j< itermCount; j++ ){
                // 如果是首次"重计算", 那么第一个元素就应该是基本顶格的
                iterms[j].style.top = totalHeight + 'px';
                var curItermHeight = window.getComputedStyle( iterms[j] ).height;
                curItermHeight = Number( curItermHeight.substr(0, curItermHeight.length-2) );

                totalHeight += curItermHeight + option.defaultMargin;
            }
        }
        
    }




    module.exports = UI;

});