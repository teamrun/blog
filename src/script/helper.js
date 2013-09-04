define(function( require, exports, module ){
    var util = require('./util');

    var $ = util.qs;

    function isDomCached( selector ){
        return $(selector)? true : false;
    }

    exports.isDomCached = isDomCached;
});