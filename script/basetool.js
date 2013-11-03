define( function(require, exports, module){
    var util = require('./util');
    var $ = util.qs,
        $A = util.qsa,
        $ajax = util.ajax,
        dataset = util.dataset;


    function md2html( mdStr ){
        return markdown.toHTML( mdStr );
    }

    function addLanguageType( mdStr ){
        var htmlStr = md2html( mdStr );
        var tempArr = htmlStr.split('<pre><code>$');
        var codeCount = tempArr.length;
        if( codeCount > 1 ){
            for( var i=0; i+1 < codeCount; i++){
                var languageEnd = tempArr[i+1].indexOf('$');

                var languageType = tempArr[i+1].substr(0, languageEnd );
                tempArr[i] +='<pre class="line-numbers"><code class="language-' + languageType + '">';
                // 剪切字符串  因为有个换行符 所以要多减一个
                tempArr[i+1] = tempArr[i+1].substr( languageEnd+1, tempArr[i+1].length);
                tempArr[i+1] = tempArr[i+1].replace(/\n/,'');
                console.log( i );
            }
        }

        return tempArr.join('');
    }

    var Blog = function( mdStr, type ){
        var thisClass = this;
        var titleReg;
        // var contentReg;
        if( mdStr ){
            if( type === 'html' ){
                titleReg = /<h\d>.+/;
                var blogStr = md2html( mdStr );
                var tempArr = blogStr.match( titleReg );
                thisClass.title = ( tempArr && tempArr.length >0 ) ? tempArr[0] : '<h2>无题</h2>';
                thisClass.content = blogStr.substr( thisClass.title.length, blogStr.length );

                thisClass.content = thisClass.content.trim();
            }
            else if( type === 'md' || !type ){
                titleReg = /#+.+\n+/;

                var tempArr = mdStr.match( titleReg );
                thisClass.title = ( tempArr && tempArr.length >0 )? tempArr[0] : '##无题';
                thisClass.content = mdStr.substr( thisClass.title.length, mdStr.length );

                thisClass.title = thisClass.title.replace(/\n/g, '');
            }
        }
        else{
            thisClass.title = '';
            thisClass.content = '';
        }

        
        return this;
    };

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
            var addClass, addTop;
            var class1B = opt.class1B||1, class2B = opt.class2B||0;
            var class1 = opt.class1, class2 = opt.class2;

            var class2repalce=opt.class2repalce;
            // 初始化两个数组, 方便进行位置冲突微调
            var c1TopArr = [], c2TopArr = [];

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
                    addClass = class2;
                    // 给元素添加定位信息top
                    addTop = class2B;
                    // 位置微调 防止左右一样top
                    c2TopArr.push( addTop );
                    adjustSlightly( c1TopArr );
                    class2B += Number( curItermHeight ) + Number( defaultMargin );
                }
                else{
                    addClass = class1;
                    addTop = class1B;
                    // 位置微调 防止左右一样top
                    c1TopArr.push( addTop );
                    adjustSlightly( c2TopArr );
                    class1B += Number( curItermHeight ) + Number( defaultMargin );
                }
                // 替换类名
                targets[i].className = targets[i].className.replace( class2repalce, addClass );
                // 填充内嵌样式
                targets[i].style.top = addTop + 'px';
                // 值备份
                dataset(targets[i], 'top', addTop );
            }

            function adjustSlightly( arr ){
                // 如果对面的最后一个家伙的top和本次很接近  就把对面的家伙向上挑一点 自己往下一点
                if( addTop - arr[ arr.length-1 ] < 30 ){
                    // console.log( targets[i-1] );
                    targets[i-1].style.top = (arr[ arr.length-1 ] - 10) + 'px';
                    addTop = arr[ arr.length-1 ] - 10 + 35;
                }
            }
            if( class1B > class2B ){
                return class1B;
            }
            else{
                return class2B;
            }
        }
        else{
            var callback = function(){};
            if( opt.class2repalce ){
                callback = function( ele ){
                    util.removeClass( ele, opt.class2repalce );
                };
            }
            for( var i=0; i<len ;i++ ){
                targets[i].style.top = curTopOffset + defaultMargin + 'px';
                var refHeight = window.getComputedStyle( refs[i] ).height;
                curTopOffset += defaultMargin + Number( refHeight.substr(0, refHeight.length-2) );

                callback( targets[i] );
            }

            return curTopOffset;
        }
    }

    // 允许个性化定制, 选择器 决定是全部定位  还是 增量定位...
    function layoutTwo( selector ){
        console.log('calling : ' + arguments.callee.name );
        var opt = {
            targetSelector: selector || '#main #itermCtn' + ' .iterm',
            // refSelector: '',
            classDef: true,
            class1: 'left',
            class2: 'right',
            class1B: 25,
            class2B: 40,
            defaultMargin: 30,
            class2repalce: 'raw'
        };
        return posDom( opt );

    }
    function layoutSingal( selector ){
        var opt = {
            targetSelector: selector || '#main #itermCtn' + ' .iterm',
            // refSelector: '',
            classDef: false,
            class1B: 0,
            class2B: 40,
            defaultMargin: 1,
            class2repalce: 'raw'
        };
        console.log('calling : ' + arguments.callee.name );
        return posDom( opt );
    }




    exports.addLanguageType = addLanguageType;
    exports.md2html = md2html;
    exports.Blog = Blog;

    exports.posDom = posDom;
    exports.layoutTwo = layoutTwo;
    exports.layoutSingal = layoutSingal;
});