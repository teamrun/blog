(function() {
  var Blog, Comment, EventProxy, Photo, blogSchema, commentSchema, config, connect, fs, importTestData, mongoose, path, photoSchema, saveCB;

  fs = require("fs");

  path = require("path");

  EventProxy = require("eventproxy");

  mongoose = require("mongoose");

  config = require("../../config");

  Blog = void 0;

  Comment = void 0;

  connect = mongoose.connect(config.dburl);

  blogSchema = mongoose.Schema({
    title: String,
    alias: String,
    author: String,
    content: String,
    summary: Object,
    tag: Array,
    dt_create: Date,
    dt_modify: Array,
    location: Object,
    like: Number,
    comment: Number
  });

  commentSchema = mongoose.Schema({
    title: String,
    content: String,
    dt_create: Date,
    commenter: String,
    commenter_email: String,
    commenter_site: String,
    to: String,
    base_article: String,
    base_cmt: String
  });

  photoSchema = mongoose.Schema({
    event: String,
    title: String,
    intro: String,
    src: String,
    majorColor: String,
    dt_create: Date,
    dt_modify: Array,
    exif: Object,
    like: Number
  });

  Blog = mongoose.model("blog", blogSchema);

  Comment = mongoose.model("comment", commentSchema);

  Photo = mongoose.model("photo", photoSchema);

  importTestData = function() {
    logger.debug(__dirname);
    logger.debug(path.resolve("./"));
    return fs.readFile("./backend/Base/database.json", "utf-8", function(err, data) {
      var blogArr, count, ep, i, tmpBlog, _results;
      if (err) {
        logger.error(err);
      }
      blogArr = JSON.parse(data);
      count = blogArr.length;
      ep = new EventProxy();
      ep.after("save test data", count, function(list) {
        return loger.debug(list);
      });
      i = 0;
      _results = [];
      while (i < count) {
        blogArr[i].dt_create = new Date();
        blogArr[i].dt_modify = [new Date()];
        tmpBlog = new Blog(blogArr[i]);
        tmpBlog.save(function(err) {
          return saveCB(err, tmpBlog, ep);
        });
        _results.push(i++);
      }
      return _results;
    });
  };

  saveCB = function(err, blogObj, ep) {
    var result;
    result = {};
    result.title = blogObj.title;
    if (err) {
      result.blSaved = false;
    } else {
      result.blSaved = true;
    }
    return ep.emit("save test data", result);
  };

  exports.Blog = Blog;

  exports.Comment = Comment;

  exports.Photo = Photo;

}).call(this);
