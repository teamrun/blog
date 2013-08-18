define(function( require, exports, module){

    var util = require('./util');
    var tools = require('./blogtool');


    var $ = util.qs;
    var $A = util.qsa;

    var Timeline = function( opt ){
        this.defaultMargin = opt.marginTop;
        this.itermCtnSelector = opt.itermCtn || '#itermCtn';
        this.itermCtn = $( this.itermCtnSelector );
        this.sideFirst = opt.sideFirst || 'left';
        this.handler = opt.handler;
        this.data = opt.data;
        this.itermConstructor = opt.itermConstructor;
        // this.itermConstructor = tools.constructor;

        this.leftBottom = this.itermCtn.offsetTop;
        this.rightBottom = this.itermCtn.offsetTop + this.defaultMargin;

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
                util.replaceClass( iterms[j], 'raw', class2add );
                iterms[j].style.top = thisClass[ class2add+'Bottom' ] + 'px';

                // 为下一次循环做准备
                var curItermHeight = window.getComputedStyle( iterms[j] ).height;

                curItermHeight = curItermHeight.substr( 0, curItermHeight.length-2 );
                thisClass[ class2add+'Bottom' ] += curItermHeight + thisClass.defaultMargin;
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

    exports.Timeline = Timeline;
});