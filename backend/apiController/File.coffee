fs = require 'fs'
path = require 'path'

config = require '../../config'
PhotoModal = require( '../base/dbo' ).Photo


errHandler = (msg, err, callback) ->
  logger.error msg
  logger.error err
  callback? err

FileUtil = {
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

}


class File
  constructor: (@name) ->
  saveToDest: (callback) ->
    if @srcPath and @destPath
      FileUtil.pipeCopy @srcPath, @destPath, callback
  createDBRecord: ( err, callback ) ->
    if not err
        logger.debug "save #{@name} suc, gonna do create DB record.."
        @doc.save callback
      else
        errHandler 'save error', err, callback

  save: (callback) ->
    if @doc
      # 将文件保存到指定位置
      # 然后创建数据库记录
      # logger.debug 'gonna save to dest path and create DB record'
      # !!!!!!!!!!!! callback 中 this 指向会变更 !!!!!!!!!
      @saveToDest (err)=>
        @createDBRecord err, callback
    else
      @saveToDest callback


class Photo extends File
  constructor: (opt) ->
    now = new Date()
    super(opt.name)
    @srcPath = opt.src
    # saveName: 文件保存名, 原名_ts.扩展名
    saveName = @name.slice(0, -(path.extname(@name).length))+
      '_'+ now.valueOf() + path.extname(@name)
    # 构造dest
    @destPath = path.join(config.photoLib, saveName )

    @doc = new PhotoModal({
      event: opt.event
      title: opt.title
      intro: opt.intro
      src: saveName
      dt_create: now
      dt_modify: [ now ]
      exif: {}
      like: 0
    })
    


module.exports = 
  FileUtil: FileUtil
  File: File,
  Photo: Photo



