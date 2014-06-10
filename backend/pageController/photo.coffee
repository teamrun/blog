config = require '../../config'
render = require './render'
PhotoMeta = require '../apiController/photoCtrl'
              .PhotoMeta

# logger.debug PhotoMeta

photoMaxAge = 2*7*24*60*60*1000


sendTimeline = (req, res) ->
  PhotoMeta.getGallery( {}, (err, data)->
    data = {
        title: 'Photo Gallery'
        prefix: config.photoThumbSrc
        photoGallery: data
    }
    render.photo( res, data )
  )

# 处理照片缩略图的请求, 即时间线上节点照片的请求
sendPhotoThumb = (req, res, next) ->
  photoSrc = req.params.photoSrc
  res.sendfile config.photoThumb+photoSrc, {maxAge: photoMaxAge}





exports.sendTimeline = sendTimeline
exports.sendPhotoThumb = sendPhotoThumb
