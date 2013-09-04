define(function( require, exports, module ){
    var util = require('./util');

    var $ = util.qs;

    var collapseBtn = $('#collapse');

    util.Event.addHandler( collapseBtn, 'click', function(e){
        util.replaceClass( $('body'), 'readmode', 'glancemode');
    } );

    var scollTopBtn = $('#scolltop');
});