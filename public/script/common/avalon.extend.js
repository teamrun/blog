avalon.filters.richText = function( str ){
    return str.replace(/\r?\n/ig, '<br/>');
};

avalon.filters.md2html = function( mdStr ){
    return Converter.makeHtml( mdStr );
};