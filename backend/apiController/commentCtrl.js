var dbo = require('../Base/dbo.js');
var config = require('../Base/config');
var Valid = require('../Base/valid');


function cmtErrHandler( funcName, err ){
    console.err( funcName + ': error occured ');
    console.error(  err );
}


var CommentMeta = {
    getByBlogID: function( blogID, callback ){
        dbo.Comment.find( {base_article: blogID}, function( err, data ){
            if( err ){
                cmtErrHandler( arguments.callee, err );
            }
            else{
                callback( data );
            }
        });
    }
};

var CommentCtrl = {
	create: function newComment( req, res ){
        checkBlogExist( req.body.base_article, cbCheck );
        function cbCheck(){
            var commentObj = {
                title: req.body.title,
                content: req.body.content,
                dt_create: new Date(),
                commenter: req.body.commenter || '',
                commenter_email: req.body.email || '',
                commenter_site: req.body.site || '',
                to: req.body.to,
                base_article: req.body.base_article,
                base_cmt: req.body.base_cmt || ''
            };

            var newCmt = new dbo.Comment( commentObj );
            newCmt.save( function(err,data){
                var resObj = {};
                if( err ){
                    resObj.code = 500;
                    resObj.msg = 'failed write into db';
                    res.send( resObj );
                }
                else{
                    resObj.code = 200;
                    resObj.msg = 'cmt created suc';
                    resObj.comment_id = data.id;
                    res.send( resObj );
                }
                return false;
            });
            return false;
        }

	},

    get: function getCommment( req, res ){
        var query = {};
        cmtMeta.getByBlogID( req.param('id'), function( data ){

        } );
        // query.base_article = req.param('id');
        // dbo.Comment.find( query, function( err, data ){
        //     var resObj = {};
        //     if( err ){
        //         resObj.code = 500;
        //         resObj.msg = 'failed query comment from db';
        //         res.send( resObj );
        //     }
        //     else{
        //         resObj.code = 200;
        //         resObj.comments = data;

        //         res.send( resObj );
        //     }
        //     return false;
        // } );
        // return false;
    },

	balabala: function getCommentByBase( req, res ){

	}
};

function checkBlogExist( _id, cb ){
    dbo.Blog.findById( _id, function( err, data ){
        // console.log( err );
        // console.log( data );
        if( err ){
            console.error('err occured when check blog exits for new cmt');
        }
        else{
            if( data._doc ){
                // console.log( data );
                cb( data );
            }
        }
    });
}

exports.CommentMeta = CommentMeta;
exports.CommentAPI = CommentCtrl;