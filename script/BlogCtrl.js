define(function( require, exports, module ){

    var util = require('./util');
    var helper = require('./helper');
    var Config = require('./config');


    var $ajax = util.ajax;


    var Blog = function( ){
        // Blog的构造函数,接受两种参数,md字符串,和已经构建好的obj
        // title为纯字符串 没有#号没有h2标签
        // this.title = '';
        // this.content = '';
        // if( arg instanceof String ){
        //     // 通过mdstr构建blog对象
        //     var titleReg = /#+.+\n+/;

        //     var tempArr = mdStr.match( titleReg );
        //     thisClass.title = ( tempArr && tempArr.length >0 )? tempArr[0] : '##无题';
        //     thisClass.content = mdStr.substr( thisClass.title.length, mdStr.length );

        //     thisClass.title = thisClass.title.replace(/[#+\n+]/g, '');
        // }
        // else if( typeof arg === 'object' && arg instanceof Object ){
        //     for( var i in arg ){
        //         this[i] = arg[i];
        //     }
        // }
        return this;
    };

    Blog.prototype.get = function( key, val, callback ){

        var selector = '.piece[data-_id="' + val + '"]';
        // if( helper.isDomCached( selector ) ){
        //     callback( [{ _id: val , content: 'cached'}] );
        // }
        // else{
            var reqParam = {
                key: key,
                value: val
            };

            $ajax( {
                url: Config.getBlogUrl,
                action: 'get',
                data: reqParam,
                callback: callback
            });
        // }
        return false;
    };
    Blog.prototype.renderContent = function(){
        return addLanguageType(this.content);
    };

    function addLanguageType( mdStr ){
        var htmlStr = markdown.toHTML( mdStr );
        var tempArr = htmlStr.split('<pre><code>$');
        var codeCount = tempArr.length;
        if( codeCount > 1 ){
            for( var i=0; i+1 < codeCount; i++){
                var languageEnd = tempArr[i+1].indexOf('$');

                var languageType = tempArr[i+1].substr(0, languageEnd );
                // tempArr[i] +='<pre class="line-numbers"><code class="language-' + languageType + '">';
                tempArr[i] +='<pre><code class="language-' + languageType + '">';
                // 剪切字符串  因为有个换行符 所以要多减一个
                tempArr[i+1] = tempArr[i+1].substr( languageEnd+1, tempArr[i+1].length);
                tempArr[i+1] = tempArr[i+1].replace(/\n/,'');
                console.log( i );
            }
        }

        return tempArr.join('');
    }



    module.exports = new Blog();
});