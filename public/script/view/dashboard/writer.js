define( function(require, exports, module ){
    var Config = require( 'script/config/config' ),
        Msg = require('script/common/msg');

    var _id = {
        popSubmitSettingBtn: 'pop-submit-setting',
        confirmSubmitBtn: 'comfirm-submit',
        submitSettingModule: 'submit-data',
        closeSubmit: 'close-submit'
    };
    var _class = {

    };

    var popSubmitSettingBtn, confirmSubmitBtn, submitSettingModule, closeSubmit;
    var iframeBody;

    var vmHelper = {
        init: function( mdStr ){
            postVM.title = _data.getPostTitle( mdStr );
            postVM.tags = '';
            postVM.like = 0;
            postVM.comment = 0;
            // default author
            postVM.author = 'chenllos';
            postVM.location = 'getting location...';
            navigator.geolocation.getCurrentPosition( function(geo){
                postVM.location = JSON.stringify( geo );
            }, function(err){
                console.log(err);
                postVM.location = 'can not get your location';
            } );
            postVM.content = mdStr;
        }
    };
    var postVM;
    avalon.ready( function(){
        postVM = avalon.define('post', function( vm ){
            vm.title = '';
            vm.tags = '';
            vm.like = '';
            vm.comment = '';
            vm.author = '';
            vm.location = '';
            vm.content = '';

            vm.init = vmHelper.init;
        });

        avalon.scan();
    } );

    var _view = {
        convertMD: function(){
            var rawText = _data.replaceSpace( editZone.innerText );
            var html = Converter.makeHtml( rawText );
            // showdown插件会在parse # 时出现id属性的误设定
            previewZone.html( html );
        },
        showSubmitPopModule: function(){
            submitSettingModule.addClass('active');
        },
        hideSubmitPopModule: function(){
            submitSettingModule.removeClass('active');
        }

    };

    var _data = {
        replaceSpace: function( text ){
            // 关键: 四个空格转换为pre>code的关键~!
            return text.replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ');
        },
        getRawText: function(){
            return iframeBody.innerText;
        },
        putRawText: function(){
            iframeBody.innerText = window.localStorage['dash-writer'] || '';
        },
        getPostTitle: function( mdStr ){
            var title = mdStr.match( /^#+.+\n+/)[0];
            if( title ){
                title = title.replace(/^#+ ?/, '').replace(/\n+/, '');
            }
            else{
                title = '无题';
            }
            return title;
        }
    };

    var _event = {
        bind: function(){
            _event.bindTimer();

            popSubmitSettingBtn.bind('click', _event.popSubmit );
            closeSubmit.bind('click', _event.closeSubmit );
            confirmSubmitBtn.bind('click', _event.submitPost );
        },
        bindTimer: function(){
            setInterval(function(){
                window.localStorage['dash-writer']= _data.getRawText();
            }, 2000);
        },
        preview: function(){

        },
        popSubmit: function(){
            var postMDStr = _data.replaceSpace( _data.getRawText() );
            setTimeout( function(){
                postVM.init( postMDStr );
            }, 500);
            setTimeout( function(){
                Prism.highlightAll();
            }, 700);
            _view.showSubmitPopModule();
        },
        closeSubmit: function(){
            _view.hideSubmitPopModule();
        },
        submitPost: function(){
            var postMDStr = _data.replaceSpace(_data.getRawText());
            // console.log( postMDStr );
            // console.log( Converter.makeHtml( postMDStr ) );
            var title = _data.getPostTitle( postMDStr );
            console.log(title);
            var param = {
                title: postVM.title,
                content: postVM.content,
                author: postVM.author,
                location: postVM.location,
                tags: ['webdev', 'module', 'diveinto']
            };

            $.post( Config.api.newPost, param, function( data, status ){
                console.log( data );
                console.log( status );
            });
        }
    };

    function init(){
        popSubmitSettingBtn = $( '#' + _id.popSubmitSettingBtn );
        confirmSubmitBtn = $( '#' + _id.confirmSubmitBtn );
        iframeBody = window.frames['md'].document.body;
        
        submitSettingModule = $( '#'+_id.submitSettingModule );
        closeSubmit = $( '#'+_id.closeSubmit );
        // = $( '#'+_id. );
        // = $( '#'+_id. );
        // = $( '#'+_id. );

        _data.putRawText();
        _event.bind();
    }

    exports.init = init;
} );