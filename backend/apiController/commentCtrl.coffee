dbo = require("../base/dbo")
logger = require("../base/log")
config = require("../../config")
Valid = require("../base/valid")


cmtErrHandler = (funcName, err) ->
  logger.error funcName + ": error occured "
  logger.error err
  return

# query.base_article = req.param('id');
# dbo.Comment.find( query, function( err, data ){
#     var resObj = {};
#     if( err ){
#         resObj.code = 500;
#         resObj.msg = 'failed query comment from db';
#         res.send( resObj );
#     }
#     else{
#         resObj.code = 200;
#         resObj.comments = data;

#         res.send( resObj );
#     }
#     return false;
# } );
# return false;
checkBlogExist = (_id, cb) ->
  dbo.Blog.findById _id, (err, data) ->
    
    # console.log( err );
    # console.log( data );
    if err
      logger.error "err occured when check blog exits for new cmt"
    else
      
      # console.log( data );
      cb data  if data._doc
    return

  return
CommentMeta = getByBlogID: (blogID, callback) ->
  dbo.Comment.find
    base_article: blogID
  , (err, data) ->
    if err
      cmtErrHandler arguments_.callee, err
    else
      callback data
    return

  return

CommentCtrl =
  create: newComment = (req, res) ->
    cbCheck = ->
      commentObj =
        title: req.body.title
        content: req.body.content
        dt_create: new Date()
        commenter: req.body.commenter or ""
        commenter_email: req.body.email or ""
        commenter_site: req.body.site or ""
        to: req.body.to
        base_article: req.body.base_article
        base_cmt: req.body.base_cmt or ""

      newCmt = new dbo.Comment(commentObj)
      newCmt.save (err, data) ->
        resObj = {}
        if err
          resObj.code = 500
          resObj.msg = "failed write into db"
          res.send resObj
        else
          resObj.code = 200
          resObj.msg = "cmt created suc"
          resObj.comment_id = data.id
          res.send resObj
        false

      false
    checkBlogExist req.body.base_article, cbCheck
    return

  get: getCommment = (req, res) ->
    query = {}
    cmtMeta.getByBlogID req.param("id"), (data) ->

    return

  balabala: getCommentByBase = (req, res) ->


exports.CommentMeta = CommentMeta;
exports.CommentAPI = CommentCtrl;