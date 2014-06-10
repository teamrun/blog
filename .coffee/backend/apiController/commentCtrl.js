(function() {
  var CommentCtrl, CommentMeta, Valid, checkBlogExist, cmtErrHandler, config, dbo, getCommentByBase, getCommment, logger, newComment;

  dbo = require("../base/dbo");

  logger = require("../base/log");

  config = require("../../config");

  Valid = require("../base/valid");

  cmtErrHandler = function(funcName, err) {
    logger.error(funcName + ": error occured ");
    logger.error(err);
  };

  checkBlogExist = function(_id, cb) {
    dbo.Blog.findById(_id, function(err, data) {
      if (err) {
        logger.error("err occured when check blog exits for new cmt");
      } else {
        if (data._doc) {
          cb(data);
        }
      }
    });
  };

  CommentMeta = {
    getByBlogID: function(blogID, callback) {
      dbo.Comment.find({
        base_article: blogID
      }, function(err, data) {
        if (err) {
          cmtErrHandler(arguments_.callee, err);
        } else {
          callback(data);
        }
      });
    }
  };

  CommentCtrl = {
    create: newComment = function(req, res) {
      var cbCheck;
      cbCheck = function() {
        var commentObj, newCmt;
        commentObj = {
          title: req.body.title,
          content: req.body.content,
          dt_create: new Date(),
          commenter: req.body.commenter || "",
          commenter_email: req.body.email || "",
          commenter_site: req.body.site || "",
          to: req.body.to,
          base_article: req.body.base_article,
          base_cmt: req.body.base_cmt || ""
        };
        newCmt = new dbo.Comment(commentObj);
        newCmt.save(function(err, data) {
          var resObj;
          resObj = {};
          if (err) {
            resObj.code = 500;
            resObj.msg = "failed write into db";
            res.send(resObj);
          } else {
            resObj.code = 200;
            resObj.msg = "cmt created suc";
            resObj.comment_id = data.id;
            res.send(resObj);
          }
          return false;
        });
        return false;
      };
      checkBlogExist(req.body.base_article, cbCheck);
    },
    get: getCommment = function(req, res) {
      var query;
      query = {};
      cmtMeta.getByBlogID(req.param("id"), function(data) {});
    },
    balabala: getCommentByBase = function(req, res) {}
  };

  exports.CommentMeta = CommentMeta;

  exports.CommentAPI = CommentCtrl;

}).call(this);
