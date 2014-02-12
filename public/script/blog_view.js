(function(){

    var apiUrl = '/app';

    var _id={
        postSection: 'post-section',
        pubCmt: 'pub-cmt',
        cmtContentTextArea: 'write-cmt',
        next: ''
    };
    var postSection, cmtContentTextArea, pubCmtBtn;
    $(document).ready( function(){
        init();
    } );

    var _data = {
        getPostID: function(){
            return postSection.attr('data-postid');
        }
    };

    var _event={
        bind: function(){
            pubCmtBtn.bind( 'click', _event.createCmt );
        },
        createCmt: function(){
            var baseArt = _data.getPostID;
            var artAuthor = '';

            var param = {
                title: cmtContentTextArea.val().substr(0, 8),
                content: cmtContentTextArea.val(),
                from: 'nobody yet',
                to: 'artAuthor',
                base_article: baseArt
            };
            $.post( apiUrl+'/comment', param, function( data, status ){
                console.log(data);
                console.log( status );
            } );
        }
    };

    function init(){
        postSection = $('#' + _id.postSection);
        pubCmtBtn = $('#' + _id.pubCmt);
        cmtContentTextArea = $('#' + _id.cmtContentTextArea);
         // = $('#' + _id.);
         // = $('#' + _id.);
         // = $('#' + _id.);
         // = $('#' + _id.);
         // = $('#' + _id.);


         _event.bind();
    }
})();