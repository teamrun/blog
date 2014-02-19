avalon.filters.richText = function( str ){
    return str.replace(/\r?\n/ig, '<br/>');
};

avalon.filters.md2html = function( mdStr ){
    return Converter.makeHtml( mdStr );
};

avalon.filters.addSyntexType = function( str ){
    var tempArr = str.split('<pre><code>$');
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
            // console.log( i );
        }
    }

    return tempArr.join('');
};