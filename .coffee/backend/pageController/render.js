(function() {
  var all, compileOption, compileRenderService, compiledJade, config, done, envStr, fs, jade, key, logger, pages, path, preCompile, render, sendPage, viewPathSet;

  fs = require("fs");

  path = require("path");

  jade = require("jade");

  logger = require("../base/log");

  config = require("../../config");

  viewPathSet = {
    helper: path.resolve(config.viewPath, "helper"),
    viewer: path.resolve(config.viewPath),
    error: path.resolve(config.viewPath, "error"),
    partial: path.resolve(config.viewPath, "partial")
  };

  pages = {
    index: "index.jade",
    photo: "photo.jade",
    post: "post.jade",
    dashboard: "dashboard.jade",
    404: "error/404.jade",
    500: "error/500.jade"
  };

  compiledJade = {};

  compileOption = {
    filename: viewPathSet.helper
  };

  render = {};

  done = 0;

  all = void 0;

  sendPage = function(res, html) {
    res.end(html);
  };

  compileRenderService = function() {
    var name;
    done = 0;
    all = 0;
    for (name in pages) {
      preCompile(path.join(viewPathSet.viewer, pages[name]), name);
      all++;
    }
  };

  preCompile = function(filePath, pageName) {
    return fs.readFile(filePath, function(err, jadeStr) {
      if (err) {
        return logger.err("read jade file err: " + filePath + ".jade");
      } else {
        compiledJade[pageName] = jade.compile(jadeStr, compileOption);
        render[pageName] = function(res, data) {
          var html;
          html = compiledJade[pageName](data);
          return sendPage(res, html);
        };
        done++;
        if (done >= all) {
          return console.timeEnd("\tre compile jade views");
        }
      }
    });
  };

  console.time("\tre compile jade views");

  compileRenderService();

  envStr = fs.readFileSync(path.join(__dirname, "../../public/dist/version.js"), "utf-8");

  if (envStr.indexOf("env: 'dev'") >= 0) {
    logger.info("developing...");
    for (key in viewPathSet) {
      fs.watch(viewPathSet[key], function() {
        console.time("\tre compile jade views");
        return compileRenderService();
      });
    }
  }

  module.exports = render;

}).call(this);
