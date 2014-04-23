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
    var resizeTimer;

    var vmHelper = {
        updateWH: function(){
            imgViewVM.width = curImg.width() + 20*2;
            imgViewVM.height = curImg.height() + 20*2;
        },
        updateMax: function(){
            clearTimeout( resizeTimer );
            setTimeout( function(){
                imgViewVM.maxWidth = $(window).width() - 40;
                imgViewVM.maxHeight = $(window).height() - 40;

                vmHelper.updateWH();
            }, 50);
        }
    };

    avalon.ready( function(){
        imgViewVM = avalon.define( 'imgView', function( vm ){
            vm.src = '';
            vm.width = 700;
            vm.height = 400;

            vm.maxWidth = 0;
            vm.maxHeight = 0;

            vm.updateMax = vmHelper.updateMax;
        } );

        avalon.scan();
    } );


    var _event = {
        bind: function(){
            $('img').bind( 'click', _event.imgViewAction );
            // load后调整容器
            curImg.bind( 'load', vmHelper.updateWH );
            closeModule.bind( 'click', _event.closeViewModule );

            $(window).bind( 'resize', imgViewVM.updateMax );
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
        imgViewVM.updateMax();
        _event.bind();
    }

    exports.init = init;
} );