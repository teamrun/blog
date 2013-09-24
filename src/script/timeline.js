define(function( require, exports, module){

    var util = require('./util');
    

    var Blog = require('./BlogCtrl');

    var UI = require('./UI');


    var $ = util.qs;
    var $A = util.qsa;

    var blogIdentitifor = '_id';

    var Timeline = function( opt ){
        var fontSize = window.getComputedStyle( document.body ).fontSize;
        fontSize = fontSize.substr(0, fontSize.length-2 );
        this.defaultMargin = fontSize*2.5 || opt.marginTop;
        this.itermCtnSelector = opt.itermCtn || '#itermCtn';
        this.itermCtn = $( this.itermCtnSelector );
        this.sideFirst = opt.sideFirst || 'left';
        this.handler = opt.handler;
        this.data = opt.data;
        this.itermConstructor = opt.itermConstructor;

        this.leftBottom = this.itermCtn.offsetTop;
        this.rightBottom = this.itermCtn.offsetTop + parseInt( this.defaultMargin );

        var thisClass = this;

        this.consIterm = function( data ){
            var htmlStr = thisClass.itermConstructor( data );
            thisClass.itermCtn.innerHTML += htmlStr;
        };


        this.position = function(){
            var iterms = $A( thisClass.itermCtnSelector + ' .iterm.raw');
            var itermCount = iterms.length;
            var class2add;
            for( var j=0; j< itermCount; j++ ){
                if( thisClass.leftBottom >= this.rightBottom ){
                    class2add = 'right';
                }
                else{
                    class2add = 'left';
                }
                // 添加合适的类,添加定位数据
                iterms[j].className = iterms[j].className.replace( 'raw', class2add );
                iterms[j].style.top = thisClass[ class2add + 'Bottom' ] + 'px';
                console.group();
                console.log( 'now positioning for: ' + j );
                console.log('it will be posed at: ' + thisClass[ class2add+'Bottom' ] );


                // 为下一次循环做准备
                var curItermHeight = window.getComputedStyle( iterms[j] ).height;
                curItermHeight = curItermHeight.substr( 0, curItermHeight.length-2 );
                console.log( j+'\'s height is: ' + curItermHeight);

                thisClass[ class2add+'Bottom' ] += Number( curItermHeight ) + Number( thisClass.defaultMargin );
                console.log( thisClass[ class2add+'Bottom' ] );
                console.groupEnd();
            }
        };

        this.init = function(){
            thisClass.consIterm( thisClass.data );
            thisClass.position();
        };

        this.addMore = function(data){
            thisClass.consIterm( data );
            thisClass.position();
        };

        return this;
    };

    Timeline.prototype.bind = function(){
        util.Event.addHandler(  $('#timeline'), 'click', delegateClick );
    };

    function delegateClick( e ){
        var target = e.target;

        if( util.hasClass( target, 'title' ) ){

            // 切换状态,glance -> read ,期间由css负责动画
            // section已显示,调用UI的呈现函数(传递"获取blog"的函数), 呈现函数负责查看是否已缓存
            // 缓存的话直接切换显示,未缓存的话,(显示loading,然后)使用传递过来的获取函数,从(本地存储)remote获取blog

            UI.switchStatus();

            // var tmpBlog = new Blog({
            //     title: target.innerHTML,
            //     _id: target.dataset[blogIdentitifor]
            // });
            // tmpBlog.get( blogIdentitifor, target.dataset[ blogIdentitifor ], UI.deliverBlog);
        }
    }

    function posDom( opt ){
        var targetSelector = opt.targetSelector;   //最后是改变谁的style值
        var refSelector = opt.refSelector || opt.targetSelector;         //根据谁来确定值
        var defaultMargin = opt.defaultMargin;
        var classDef = opt.classDef;
        var curTopOffset = opt.curTopOffset || 0 - defaultMargin;

        var targets = $A( targetSelector );
        var refs = $A( refSelector );
        var len = refs.length;
        if( classDef ){
            var class2add;

            for( var i=0; i<len ;i++ ){

            }
        }
        else{
            for( var i=0; i<len ;i++ ){
                targets[i].style.top = curTopOffset + defaultMargin + 'px';
                var refHeight = window.getComputedStyle( refs[i] ).height;
                curTopOffset += defaultMargin + Number( refHeight.substr(0, refHeight.length-2) );
            }
        }
    }


    exports.Timeline = Timeline;
});