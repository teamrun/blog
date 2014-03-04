define( function( require, exports, module ){
    var Msg = require('../../common/msg');

    var apiUrl = '/app';

    var _id={
        postSection: 'post-section',
        pubCmt: 'pub-cmt',
        cmtContentInput: 'write-cmt',
        authorInput: 'cmt-author',
        authorEmailInput: 'author-email',
        authorSiteInput: 'author-site',
        next: ''
    };
    var _class={
        newlyPubed: 'newly-pubed'
    };
    var postSection, pubCmtBtn;
    var cmtContentInput, authorInput, authorEmailInput, authorSiteInput;

    var commentVM;
    avalon.ready( function(){
        commentVM = avalon.define( 'comment', function(vm){
            vm.comments = [];
        } );

        avalon.scan();
    } );

    var _data = {
        initInputs: function(){
            authorInput.val( $.cookie('commenter') || '' );
            authorEmailInput.val( $.cookie('email') || '' );
            authorSiteInput.val( $.cookie('site') || '' );
        },
        getPostID: function(){
            return postSection.attr('data-postid');
        },
        pubCmtCallback: function( cmtObj ){
            commentVM.comments.push( cmtObj );
            setTimeout( function(){
                $('.'+_class.newlyPubed).attr('class', 'processed');
            }, 10 );
        }
    };

    var _event = {
        bind: function(){
            pubCmtBtn.bind( 'click', _event.createCmt );
        },
        createCmt: function(){
            var commentContent = cmtContentInput.val();
            if( !commentContent ){
                return false;
            }
            var baseArt = _data.getPostID;
            var artAuthor = '';

            var author = authorInput.val();

            var param = {
                title: commentContent.substr(0, 8),
                content: commentContent,
                commenter: author || 'John Smith',
                to: 'artAuthor',
                base_article: baseArt,
                email: authorEmailInput.val(),
                site: authorSiteInput.val()
            };
            $.post( apiUrl+'/comment', param, function( data, status ){
                // console.log(data);
                // console.log( status );

                cmtContentInput.val('');
                $.cookie('commenter', param.commenter, {expires: 30, domain: '', path: '/'});
                $.cookie('email', param.email, {expires: 30, domain: '', path: '/'});
                $.cookie('site', param.site, {expires: 30, domain: '', path: '/'});

                _data.pubCmtCallback( {
                    content: param.content,
                    commenter: param.commenter,
                    site: param.site,
                    dt_create: Date.now()
                } );

                Msg.pop( {
                    title: 'cmt pub suc',
                    content: JSON.stringify( data )
                } );
            } );
        }
    };

    function init(){
        postSection = $('#' + _id.postSection);
        pubCmtBtn = $('#' + _id.pubCmt);

        cmtContentInput = $('#' + _id.cmtContentInput);
        authorInput = $('#' + _id.authorInput );
        authorEmailInput = $('#' + _id.authorEmailInput );
        authorSiteInput = $('#' + _id.authorSiteInput );
         // = $('#' + _id.);
         // = $('#' + _id.);

        _data.initInputs();
        _event.bind();
    }
    exports.init = init;
});