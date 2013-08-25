define(function( require, exports, module){

    var util = require('./util');

    var Blog = require('./blogCtrl');

    var UI = require('./UI');


    var $ = util.qs;
    var $A = util.qsa;

    var blogIdentitifor = '_id';

    var Timeline = function( opt ){
        this.defaultMargin = '60' || opt.marginTop;
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
            // var itermCount = data.length;
            // var htmlStr = '';
            // for( var i=0; i< itermCount; i++ ){
            //     htmlStr += thisClass.itermConstructor( data[i]);
            // }

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
                // util.replaceClass( iterms[j], 'raw', class2add );
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
            var tmpBlog = new Blog({
                title: target.innerHTML,
                _id: target.dataset[blogIdentitifor]
            });
            tmpBlog.get( blogIdentitifor, target.dataset[ blogIdentitifor ], UI.deliverBlog);
        }
    }

    exports.Timeline = Timeline;
});