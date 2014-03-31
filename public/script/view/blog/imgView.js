define( function( require, exports, module ){
    var _id = {
        imgViewModule: 'view-img-module',
        curImg: 'view-img-module .content img'
    };
    var _class = {
        moduleActive: 'active',
        closeModule: 'close-module'
    };

    var imgViewModule, curImg, closeModule;

    var imgViewVM;

    var vmHelper = {
        updateWH: function(){
            imgViewVM.width = curImg.width() + 30*2;
            imgViewVM.height = curImg.height() + 30*2;
        }
    };

    avalon.ready( function(){
        imgViewVM = avalon.define( 'imgView', function( vm ){
            vm.src = '';
            vm.width = 700;
            vm.height = 400;

            // vm.$watch( src, function( oldVal, newVal ){
            //     vm.width = 700;
            //     vm.height = 400;
            //     if(  )
            // } );
        } );

        avalon.scan();
    } );


    var _event = {
        bind: function(){
            $('img').bind('click', _event.imgViewAction );
            // load后调整容器
            curImg.bind( 'load', vmHelper.updateWH );
            closeModule.bind('click', _event.closeViewModule );
        },
        imgViewAction: function(){
            var img = $(this);
            imgViewVM.src = img.attr('src');
            imgViewModule.addClass( _class.moduleActive );
        },
        closeViewModule: function(){
            imgViewModule.removeClass( _class.moduleActive );
        }
    };


    function init(){
        imgViewModule = $('#' + _id.imgViewModule );
        curImg = $('#' + _id.curImg );
        closeModule = $('.' + _class.closeModule );
        // = $('#' + _id. );

        _event.bind();
    }

    exports.init = init;
} );