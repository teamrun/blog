(function() {
  var PhotoMeta, config, photoMaxAge, render, sendPhotoThumb, sendTimeline;

  config = require('../../config');

  render = require('./render');

  PhotoMeta = require('../apiController/photoCtrl').PhotoMeta;

  photoMaxAge = 2 * 7 * 24 * 60 * 60 * 1000;

  sendTimeline = function(req, res) {
    return PhotoMeta.getGallery({}, function(err, data) {
      data = {
        title: 'Photo Gallery',
        prefix: config.photoThumbSrc,
        photoGallery: data
      };
      return render.photo(res, data);
    });
  };

  sendPhotoThumb = function(req, res, next) {
    var photoSrc;
    photoSrc = req.params.photoSrc;
    return res.sendfile(config.photoThumb + photoSrc, {
      maxAge: photoMaxAge
    });
  };

  exports.sendTimeline = sendTimeline;

  exports.sendPhotoThumb = sendPhotoThumb;

}).call(this);
