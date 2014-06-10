(function() {
  var ErrorPage, EventProxy, PhotoPageCtrl, blogMeta, cmtMeta, config, doubleDigit, errorHandling, fs, jade, logger, md, md2html, path, render, sendDashBoard, sendPostList, sendSpecificPost, time, viewPath;

  fs = require("fs");

  path = require("path");

  EventProxy = require("eventproxy");

  jade = require("jade");

  md2html = require("node-markdown").Markdown;

  config = require("../../config");

  logger = require("../base/log");

  render = require("./render");

  blogMeta = require("../apiController/blogCtrl").BlogMeta;

  cmtMeta = require("../apiController/commentCtrl").CommentMeta;

  PhotoPageCtrl = require("./photo");

  errorHandling = require("./error");

  viewPath = path.resolve(__dirname, "../../views");

  doubleDigit = function(n) {
    if (n < 10) {
      return String("0" + n);
    } else {
      return n;
    }
  };

  time = function(dateObj) {
    var d, date, h, m, month, year;
    d = dateObj;
    year = d.getFullYear();
    month = d.getMonth() + 1;
    date = d.getDate();
    h = d.getHours();
    m = d.getMinutes();
    return year + "-" + doubleDigit(month) + "-" + doubleDigit(date) + " " + doubleDigit(h) + ":" + doubleDigit(m);
  };

  md = function(str) {
    return md2html(str);
  };

  sendPostList = function(req, res) {
    return blogMeta._getSome(function(postList) {
      var data;
      data = {
        title: "chenllos的博客",
        posts: postList,
        mdFilter: md
      };
      return render.index(res, data);
    });
  };

  sendSpecificPost = function(req, res, next) {
    var postID;
    postID = req.param("id");
    return blogMeta._getThePost(postID, function(err, postModel) {
      var data;
      if (err) {
        return next(err);
      } else {
        if (!postModel) {
          render["error/404"](res, {
            route: "sendSpecificPost"
          });
          return false;
        }
        data = {
          title: postModel.title,
          art: postModel,
          timeFilter: time,
          mdFilter: md
        };
        return render.post(res, data);
      }
    });
  };

  sendDashBoard = function(req, res) {
    return render.dashboard(res, {});
  };

  ErrorPage = {
    404: function(req, res) {
      return render[404](res, {});
    },
    500: function(req, res) {
      return render[500](res, {});
    }
  };

  exports.postsList = sendPostList;

  exports.thePost = sendSpecificPost;

  exports.Photo = PhotoPageCtrl;

  exports.dashboard = sendDashBoard;

  exports["404"] = ErrorPage[404];

  exports["500"] = ErrorPage[500];

}).call(this);
