( function(){

    var _id={
        aboutLink: 'about-link',
        aboutModule: 'about',
        aboutMask: 'about .mask'
    };
    var _class={
        activeAbout: 'active',
        hideAbout: 'hide'
    };

    var aboutLink, aboutModule, aboutMask;


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
        // = $( '#' + _id. );
        // = $( '#' + _id. );

        _event.bind();
    }

    init();

} )();