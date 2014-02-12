define( function(require, exports, module ){
    var Config = require( '../config/config' );

    var _id = {
        previewBtn: 'preview-btn',
        submitBtn: 'submit-btn'
    };
    var _class = {

    };

    var submitBtn, previewBtn;
    var iframeBody;


    var _view = {
        convertMD: function(){
            var rawText = _data.replaceSpace( editZone.innerText );
            var html = Converter.makeHtml( rawText );
            // showdown插件会在parse # 时出现id属性的误设定
            previewZone.html( html );
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
        }
    };

    var _event = {
        bind: function(){
            _event.bindTimer();

            submitBtn.bind('click', _event.submitPost );
        },
        bindTimer: function(){
            setInterval(function(){
                window.localStorage['dash-writer']= _data.getRawText();
            }, 2000);
        },
        preview: function(){

        },
        popSubmit: function(){

        },
        submitPost: function(){
            var postMDStr = _data.replaceSpace(_data.getRawText());
            // console.log( postMDStr );
            // console.log( Converter.makeHtml( postMDStr ) );
            var title = postMDStr.match( /^#+.+\n+/)[0];
            title = title.replace(/^#+/, '').replace(/\n+/, '');
            console.log(title);
            var param = {
                title: title,
                content: postMDStr,
                author: 'chenllos',
                location: '',
                tags: ['webdev', 'module', 'diveinto']
            };

            $.post( Config.api.newPost, param, function( data, status ){
                console.log( data );
                console.log( status );
            });
        }
    };

    function init(){
        previewBtn = $( '#' + _id.previewBtn );
        submitBtn = $( '#' + _id.submitBtn );
        iframeBody = window.frames['md'].document.body;
        // = $( '#'+_id. );
        // = $( '#'+_id. );
        // = $( '#'+_id. );
        // = $( '#'+_id. );
        // = $( '#'+_id. );

        _data.putRawText();
        _event.bind();
    }

    exports.init = init;
} );