path = require("path")
fs = require("fs")
mkdirp = require("mkdirp")
_ = require("underscore")
env = "dev"
HomePath = process.env[(if (process.platform is "win32") then "USERPROFILE" else "HOME")]
config =
  env: env
  port: 3000
  dburl: "mongodb://localhost/blog"
  
  # dburl: 'mongodb://chenllos.com/blog',
  # 两类请求的基础路径..
  apiBase: "/app"
  pageBase: ""
  
  # 视图文件路径
  viewPath: "./views"

  # photo : file
  photoThumb: "./thumb/"
  photoThumb2x: "./thumb2x/"
  photoBlurThumb: "./thumb_blur/"
  photoBlurThumb2x: "./thumb_blur2x/"
  photoThumbSize: 400
  photoThumbSize2x: 800
  # photo : url
  photoThumbSrc: '/photo/thumb/'
  notAllow: [""]

envConfig =
  dev:
    photoLib: path.join(HomePath, "./Pictures/blogPhoto/")
    # 上传临时文件夹
    uploadTmp: path.join(HomePath, "./Pictures/uploadTmp/")

  pro:
    uploadTmp: path.join("/var/tmp/")
    photoLib: path.join(HomePath, "./blogPhoto/")

_.extend config, envConfig[env]

config.photoThumb = path.join config.photoLib, config.photoThumb
config.photoThumb2x = path.join config.photoLib, config.photoThumb2x
config.photoBlurThumb = path.join config.photoLib, config.photoBlurThumb
config.photoBlurThumb2x = path.join config.photoLib, config.photoBlurThumb2x

mkdirp.sync config.uploadTmp
mkdirp.sync config.photoLib
mkdirp.sync config.photoThumb
mkdirp.sync config.photoBlurThumb
mkdirp.sync config.photoThumb2x
mkdirp.sync config.photoBlurThumb2x

module.exports = config
