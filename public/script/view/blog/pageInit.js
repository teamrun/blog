define( function( require, exports, module ){
    var util = require('../../common/util');

    var _id={
        aboutLink: 'about-link',
        aboutModule: 'about',
        aboutMask: 'about .mask'
    };
    var _class={
        activeAbout: 'active',
        hideAbout: 'hide',
        postTime: 'create-time .time-text'
    };

    var aboutLink, aboutModule, aboutMask, postTimes;

    var _view = {
        init: function(){
            _view.initTime();
        },
        initTime: function(){
            postTimes.each(function( index, ele){
                var dataStr = ele.dataset['createtime'];
                var date = new Date( dataStr );
                var y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate(), h = date.getHours();
                // ele.innerHTML = util.makeDouble(h) + ' ' +util.makeDouble(m)+'/'+util.makeDouble(d)+'/'+y;
                ele.innerHTML = y + '/' + util.makeDouble(m)+'/'+util.makeDouble(d);
            });
        }
    };


    var _event = {
        bind: function(){
            aboutLink.bind('click', _event.popAbout);
            aboutMask.bind('click', _event.hideAbout);
        },
        popAbout: function(e){
            e.preventDefault();
            aboutModule.addClass( _class.activeAbout );
            return false;
        },
        hideAbout: function(e){
            e.preventDefault();
            aboutModule.addClass( _class.hideAbout );
            setTimeout( function(){
                aboutModule.removeClass( _class.activeAbout + ' ' + _class.hideAbout );
            }, 300 );
            
            return false;
        }
    };

    function init(){
        aboutLink = $( '#' + _id.aboutLink );
        aboutModule = $( '#' + _id.aboutModule );
        aboutMask = $( '#' + _id.aboutMask );

        postTimes = $( '.' + _class.postTime );
        
        // = $( '#' + _id. );
        // = $( '#' + _id. );
        // = $( '#' + _id. );
        // = $( '#' + _id. );
        // = $( '#' + _id. );

        _view.init();

        _event.bind();
    }

    module.exports = {
        init: init
    };
} );