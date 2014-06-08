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
  photoThumb: "./thumb"
  photoBlurThumb: "./thumb_blur"
  notAllow: [""]

envConfig =
  dev:
    photoLib: path.join(HomePath, "./Pictures/blogPhoto")
    
    # 上传临时文件夹
    uploadTmp: path.join(HomePath, "./Pictures/uploadTmp")

  pro:
    uploadTmp: path.join("/var/tmp")
    photoLib: path.join(HomePath, "./blogPhoto")

_.extend config, envConfig[env]
mkdirp.sync config.uploadTmp
mkdirp.sync config.photoLib
mkdirp.sync path.join(config.photoLib, config.photoThumb)
mkdirp.sync path.join(config.photoLib, config.photoBlurThumb)
module.exports = config
