path = require 'path'

config = require('../../config')

PhotoModal = require( '../base/dbo' ).Photo
Photo = require('./File').Photo

PhotoMeta = 
  saveUpload: (req, callback) ->
    p = new Photo({
      name: req.files.photo.originalname
      src: req.files.photo.path
      event: req.body.event
      title: req.body.title
      intro: req.body.intro
    })
    p.save callback

    if req.body.thumb
      logger.debug 'thumb upoloaded from client'
    else
      logger.debug 'we have to generate our own thumb'



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


exports.PhotoAPI = PhotoAPI
exports.PhotoMeta = PhotoMeta