(function() {
  var HomePath, config, env, envConfig, fs, mkdirp, path, _;

  path = require("path");

  fs = require("fs");

  mkdirp = require("mkdirp");

  _ = require("underscore");

  env = "dev";

  HomePath = process.env[(process.platform === "win32" ? "USERPROFILE" : "HOME")];

  config = {
    env: env,
    port: 3000,
    dburl: "mongodb://localhost/blog",
    apiBase: "/app",
    pageBase: "",
    viewPath: "./views",
    photoThumb: "./thumb/",
    photoThumb2x: "./thumb2x/",
    photoBlurThumb: "./thumb_blur/",
    photoBlurThumb2x: "./thumb_blur2x/",
    photoThumbSize: 400,
    photoThumbSize2x: 800,
    photoThumbSrc: '/photo/thumb/',
    notAllow: [""]
  };

  envConfig = {
    dev: {
      photoLib: path.join(HomePath, "./Pictures/blogPhoto/"),
      uploadTmp: path.join(HomePath, "./Pictures/uploadTmp/")
    },
    pro: {
      uploadTmp: path.join("/var/tmp/"),
      photoLib: path.join(HomePath, "./blogPhoto/")
    }
  };

  _.extend(config, envConfig[env]);

  config.photoThumb = path.join(config.photoLib, config.photoThumb);

  config.photoThumb2x = path.join(config.photoLib, config.photoThumb2x);

  config.photoBlurThumb = path.join(config.photoLib, config.photoBlurThumb);

  config.photoBlurThumb2x = path.join(config.photoLib, config.photoBlurThumb2x);

  mkdirp.sync(config.uploadTmp);

  mkdirp.sync(config.photoLib);

  mkdirp.sync(config.photoThumb);

  mkdirp.sync(config.photoBlurThumb);

  mkdirp.sync(config.photoThumb2x);

  mkdirp.sync(config.photoBlurThumb2x);

  module.exports = config;

}).call(this);
