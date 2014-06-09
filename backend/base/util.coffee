fs = require 'fs'
path = require 'path'

gm =require 'gm'

errHandler = (msg, err, callback) ->
  logger.error msg
  logger.error err
  callback? err

Util = {
  file:
    pipeCopy: (src, dest, callback) ->
      pipeCopyErrHandler = (err) ->
        errHandler 'pipe copy err', err, callback
      logger.debug 'stream pipe...\n', src, ' -> ', dest
      # stream pipe and copy
      readStream = fs.createReadStream src
      writeStream = fs.createWriteStream dest
      readStream.pipe writeStream

      readStream.on 'error', pipeCopyErrHandler
      writeStream.on 'error', pipeCopyErrHandler
      writeStream.on 'close', ()->
        logger.debug 'pipe copy done... gonna do callback', typeof callback
        callback? null
    saveBase64: (base64Str, dest, callback) ->
      fs.writeFile dest, base64Str, callback
  img:
    genThumb: (opt)->
      gm opt.src
        .resize opt.w, opt.h
        .write opt.dest, opt.callback

  # eventproxy callback generator 
  epcbGen: (epObj, msg)->
    return (err, data)->
      if err
        epObj.emit 'error', err
      else
        epObj.emit msg, data
}


module.exports = Util
