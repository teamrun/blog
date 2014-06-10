(function() {
  var Util, errHandler, fs, gm, path;

  fs = require('fs');

  path = require('path');

  gm = require('gm');

  errHandler = function(msg, err, callback) {
    logger.error(msg);
    logger.error(err);
    return typeof callback === "function" ? callback(err) : void 0;
  };

  Util = {
    file: {
      pipeCopy: function(src, dest, callback) {
        var pipeCopyErrHandler, readStream, writeStream;
        pipeCopyErrHandler = function(err) {
          return errHandler('pipe copy err', err, callback);
        };
        logger.debug('stream pipe...\n', src, ' -> ', dest);
        readStream = fs.createReadStream(src);
        writeStream = fs.createWriteStream(dest);
        readStream.pipe(writeStream);
        readStream.on('error', pipeCopyErrHandler);
        writeStream.on('error', pipeCopyErrHandler);
        return writeStream.on('close', function() {
          logger.debug('pipe copy done... gonna do callback', typeof callback);
          return typeof callback === "function" ? callback(null) : void 0;
        });
      },
      saveBase64: function(base64Str, dest, callback) {
        return fs.writeFile(dest, base64Str, callback);
      }
    },
    img: {
      genThumb: function(opt) {
        return gm(opt.src).resize(opt.w, opt.h).write(opt.dest, opt.callback);
      }
    },
    epcbGen: function(epObj, msg) {
      return function(err, data) {
        if (err) {
          return epObj.emit('error', err);
        } else {
          return epObj.emit(msg, data);
        }
      };
    }
  };

  module.exports = Util;

}).call(this);
