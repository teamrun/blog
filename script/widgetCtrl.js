define(function( require, exports, module ){
    var util = require('./util');
    var timeline = require('./Timeline');

    var $ = util.qs;
    var $A = util.qsa;
    var dataset = util.dataset;

    var collapseBtn = $('#collapse');

    util.Event.addHandler( collapseBtn, 'click', function(e){
        util.replaceClass( $('body'), 'readmode', 'glancemode');

        // var opt = {
        //     targetSelector: '#timeline' + ' .iterm',
        //     // refSelector: '',
        //     classDef: true,
        //     class1: 'left',
        //     class2: 'right',
        //     class1B: 0,
        //     class2B: 40,
        //     defaultMargin: 40,
        //     class2repalce: 'raw'
        // };
        // // console.log( opt );

        // console.log( timeline.posDom );

        // // 为什么方法执行和不执行都是一样的呢```不对 是没找到.raw
        // timeline.posDom( opt );

        // 可以向张哥学习把这些东西缓存在内存里  cllCenter~
        var targets = $A('#timeline .iterm');
        var len = targets.length;
        for( var i=0; i<len; i++){
            targets[i].style.top = dataset(targets[i], 'top') + 'px';
        }

    } );

    var scollTopBtn = $('#scolltop');
});