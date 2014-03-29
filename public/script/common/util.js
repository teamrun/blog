define( function( require, exports, module ){
    var util = {
        makeDouble: function( n ){
            if( n <10 || n.length < 2 ){
                return String( '0'+n);
            }
            else{
                return n;
            }
        }
    };

    module.exports = util;
} );