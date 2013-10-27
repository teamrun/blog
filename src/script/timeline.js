define(function( require, exports, module){

    var util = require('./util');
    

    var Blog = require('./BlogCtrl');

    var UI = require('./UI');


    var $ = util.qs;
    var $A = util.qsa;
    var dataset = util.dataset;

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
            var opt = {
                targetSelector: thisClass.itermCtnSelector + ' .iterm.raw',
                // refSelector: '',
                classDef: true,
                class1: 'left',
                class2: 'right',
                class1B: thisClass.leftBottom,
                class2B: thisClass.rightBottom,
                defaultMargin: thisClass.defaultMargin,
                class2repalce: 'raw'
            };
            console.log( opt );

            posDom( opt );
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

            var option = {
                targetSelector: '#timeline .iterm',
                refSelector: '#timeline .iterm .bubble',
                defaultMargin: 60,
                classDef: false,
                curTopOffset: 0
            };

            posDom( option );

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
            var class2add, top2add;
            var class1B = opt.class1B||1, class2B = opt.class2B||0;
            var class1 = opt.class1, class2 = opt.class2;

            var class2repalce=opt.class2repalce;
            // var startB1 = opt.startB1||0, startB2 = opt.startB2||-1;

            var curItermHeight;
            for( var i=0; i<len ;i++ ){

                // 计算当前元素的高度
                curItermHeight = window.getComputedStyle( targets[i] ).height;
                curItermHeight = curItermHeight.substr( 0, curItermHeight.length-2 );
                // console.group();
                // console.log('当前>>>左边底部:'+ class1B);
                // console.log('当前<<<右边底部'+ class2B);
                // console.log('当前iterm高度:'+ curItermHeight);
                // console.groupEnd();

                // 确定要添加的类 和 更新两个"底部值""
                if( class1B >= class2B ){
                    class2add = class2;
                    // 给元素添加定位信息top
                    top2add = class2B;
                    class2B += Number( curItermHeight ) + Number( defaultMargin );
                }
                else{
                    class2add = class1;
                    top2add = class1B;
                    class1B += Number( curItermHeight ) + Number( defaultMargin );
                }
                targets[i].className = targets[i].className.replace( class2repalce, class2add );
                targets[i].style.top = top2add + 'px';
                dataset(targets[i], 'top', top2add );
            }

            return [ class1B, class2B ];
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
    exports.posDom = posDom;
});