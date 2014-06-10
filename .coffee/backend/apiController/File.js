(function() {
  var File, Photo, PhotoModal, Util, config, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  path = require('path');

  config = require('../../config');

  Util = require('../base/util');

  PhotoModal = require('../base/dbo').Photo;

  File = (function() {
    function File(name) {
      this.name = name;
    }

    File.prototype.saveToDest = function(callback) {
      if (this.srcPath && this.destPath) {
        return Util.file.pipeCopy(this.srcPath, this.destPath, callback);
      }
    };

    File.prototype.createDBRecord = function(err, callback) {
      if (!err) {
        logger.debug("save " + this.name + " suc, gonna do create DB record..");
        return this.doc.save(callback);
      } else {
        logger.error("save error: " + err);
        return callback(err);
      }
    };

    File.prototype.save = function(callback) {
      if (this.doc) {
        return this.saveToDest((function(_this) {
          return function(err) {
            return _this.createDBRecord(err, callback);
          };
        })(this));
      } else {
        return this.saveToDest(callback);
      }
    };

    return File;

  })();

  Photo = (function(_super) {
    __extends(Photo, _super);

    function Photo(opt) {
      Photo.__super__.constructor.call(this, opt.name);
      this.srcPath = opt.src;
      this.destPath = path.join(config.photoLib, opt.name);
      this.doc = new PhotoModal({
        event: opt.event,
        title: opt.title,
        intro: opt.intro,
        src: opt.name,
        dt_create: opt.now,
        dt_modify: [opt.now],
        exif: opt.exif,
        like: 0
      });
    }

    return Photo;

  })(File);

  module.exports = {
    File: File,
    Photo: Photo
  };

}).call(this);
