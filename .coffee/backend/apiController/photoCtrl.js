(function() {
  var EP, ExifImage, Photo, PhotoAPI, PhotoMeta, PhotoModal, Util, config, gm, path;

  path = require('path');

  ExifImage = require('exif').ExifImage;

  gm = require('gm');

  EP = require('eventproxy');

  config = require('../../config');

  Util = require('../base/util');

  PhotoModal = require('../base/dbo').Photo;

  Photo = require('./File').Photo;

  PhotoMeta = {
    saveUpload: function(req, callback) {
      var ep, err, imgTmpPath, now, oName, saveName, thumbOpt;
      ep = new EP();
      ep.all('file-db-save', 'thumb', 'thumb2x', function(db, thumb) {
        return callback(null);
      });
      ep.bind('error', function(err) {
        ep.unbind();
        logger.error("error caught by eventproxy: " + err);
        return callback(err);
      });
      imgTmpPath = req.files.photo.path;
      now = new Date();
      oName = req.files.photo.originalname;
      saveName = oName.slice(0, -(path.extname(oName).length)) + '_' + now.valueOf() + path.extname(oName);
      try {
        new ExifImage({
          image: imgTmpPath
        }, function(err, exifDate) {
          var p;
          if (err) {
            return ep.emit('error', err);
          } else {
            p = new Photo({
              name: saveName,
              src: imgTmpPath,
              event: req.body.event,
              title: req.body.title,
              intro: req.body.intro,
              majorColor: req.body.majorColor || '#eee',
              now: now,
              exif: exifDate
            });
            return p.save(function(err) {
              if (err) {
                return ep.emit('error', err);
              } else {
                return ep.emit('file-db-save', null);
              }
            });
          }
        });
      } catch (_error) {
        err = _error;
        logger.error("catched err: while read exif info and save image and create DB record");
        logger.error(err);
      }
      if (req.body.thumb) {
        return logger.debug('thumb upoloaded from client');
      } else {
        logger.debug('we have to generate our own thumb');
        thumbOpt = {
          src: imgTmpPath,
          w: 400,
          dest: path.join(config.photoThumb, saveName),
          callback: Util.epcbGen(ep, 'thumb')
        };
        Util.img.genThumb(thumbOpt);
        thumbOpt.w = 800;
        thumbOpt.dest = path.join(config.photoThumb2x, saveName);
        thumbOpt.callback = Util.epcbGen(ep, 'thumb2x');
        return Util.img.genThumb(thumbOpt);
      }
    },
    getGallery: function(opt, callback) {
      return PhotoModal.find({}, '_id event title src dt_create intro like').sort({
        dt_create: 'desc'
      }).exec(function(err, data) {
        return callback(err, data);
      });
    }
  };

  PhotoAPI = {
    upload: function(req, res, next) {
      return PhotoMeta.saveUpload(req, function(err) {
        if (err) {
          err.code = 500;
          return next(err);
        } else {
          logger.debug('save file and create DB record suc!');
          return res.json({
            code: 200,
            msg: 'photo upload succed!'
          });
        }
      });
    },
    getGallery: function(req, res, next) {
      return PhotoMeta.getGallery({}, function(err, data) {
        if (err) {
          return next(err);
        } else {
          return req.json(data);
        }
      });
    }
  };

  exports.PhotoAPI = PhotoAPI;

  exports.PhotoMeta = PhotoMeta;

}).call(this);
