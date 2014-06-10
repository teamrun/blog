path = require 'path'

ExifImage = require('exif').ExifImage
gm = require 'gm'
EP = require 'eventproxy'

config = require('../../config')
Util = require '../base/util'
PhotoModal = require( '../base/dbo' ).Photo
Photo = require('./File').Photo

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# POST /app/photo 200 1140.096 ms - 41
# 用时有点多啊~! 1秒多的时间处理整个流程, 现在就是这里稍微有点阻塞:
# 读取完exif才能saveDB, 但是由于saveDB是和pipeCopy绑在一起的, 所以是
# 读取exif -> pipeCopy -> saveDB
# 能把这三个都变成异步吗? exif -> saveDB不能变...
# 回去console.log time输出一下...每一步
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


PhotoMeta = 
  saveUpload: (req, callback) ->
    ep = new EP()
    # 几个并行的操作:
    # 1. 获取exif信息, 保存文件, 保存数据库记录
    # 2. 生成缩略图
    # 3. 生成2x缩略图
    # 4. 生成blur缩略图
    ep.all('file-db-save', 'thumb', 'thumb2x', (db, thumb)->
      callback null
    )
    ep.bind 'error',(err) ->
      ep.unbind()
      logger.error "error caught by eventproxy: #{err}"
      callback err
    # 1.
    imgTmpPath = req.files.photo.path
    # saveName: 文件保存名, 原名_ts.扩展名
    now = new Date()
    oName = req.files.photo.originalname
    saveName = oName.slice(0, -(path.extname(oName).length))+
      '_'+ now.valueOf() + path.extname(oName)
    try
      new ExifImage({image: imgTmpPath}, (err, exifDate) ->
        if err
          ep.emit 'error', err
        else
          p = new Photo({
            name: saveName
            src: imgTmpPath
            event: req.body.event
            title: req.body.title
            intro: req.body.intro
            majorColor: req.body.majorColor or '#eee'
            now: now
            exif: exifDate
          })
          p.save (err)->
            if err
              ep.emit 'error',err
            else
              # 成功也不用传递数据
              ep.emit 'file-db-save', null
      )
    catch err
      logger.error "catched err: while read exif info 
        and save image 
        and create DB record"
      logger.error err
    
    if req.body.thumb
      logger.debug 'thumb upoloaded from client'
    else
      logger.debug 'we have to generate our own thumb'
      # 2.
      thumbOpt =
        src: imgTmpPath
        w: 400
        dest: path.join(config.photoThumb,saveName)
        callback: Util.epcbGen ep, 'thumb'
      Util.img.genThumb thumbOpt
      
      # 3.
      thumbOpt.w = 800
      thumbOpt.dest = path.join(config.photoThumb2x,saveName)
      thumbOpt.callback = Util.epcbGen ep, 'thumb2x'
      Util.img.genThumb thumbOpt

  getGallery: (opt, callback) ->
    PhotoModal.find {},'_id event title src dt_create intro like'
      .sort {dt_create: 'desc'}
      .exec ( err, data ) ->
        callback err, data



# Photo 的 CRUG 操作
PhotoAPI = 
  upload: (req, res, next) ->
    PhotoMeta.saveUpload req, (err) ->
      if err
        err.code = 500
        next err
      else
        logger.debug 'save file and create DB record suc!'
        res.json {
          code: 200
          msg: 'photo upload succed!'
        }

  getGallery: (req, res, next) ->
    PhotoMeta.getGallery( {}, (err, data) ->
      if err
        next err
      else
        req.json( data )
    )


exports.PhotoAPI = PhotoAPI
exports.PhotoMeta = PhotoMeta