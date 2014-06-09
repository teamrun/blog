fs = require 'fs'
path = require 'path'

config = require '../../config'
Util = require '../base/util'

PhotoModal = require( '../base/dbo' ).Photo





class File
  constructor: (@name) ->
  saveToDest: (callback) ->
    if @srcPath and @destPath
      Util.file.pipeCopy @srcPath, @destPath, callback
  createDBRecord: ( err, callback ) ->
    if not err
        logger.debug "save #{@name} suc, gonna do create DB record.."
        @doc.save callback
      else
        logger.error "save error: #{err}"
        callback err

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
    super(opt.name)
    @srcPath = opt.src
    # 构造dest
    @destPath = path.join(config.photoLib, opt.name )

    @doc = new PhotoModal({
      event: opt.event
      title: opt.title
      intro: opt.intro
      src: opt.name
      dt_create: opt.now
      dt_modify: [ opt.now ]
      exif: opt.exif
      like: 0
    })
    


module.exports = 
  File: File,
  Photo: Photo



