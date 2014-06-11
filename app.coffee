#### js2coffee version 0.3.0
timerStr = 'blog程序启动用时'
console.time timerStr
#### ---- app.js
path = require("path")
express = require("express")
morgan = require("morgan")
bodyParser = require("body-parser")
cookieParser = require("cookie-parser")
compress = require("compression")

# 文件上传
multer = require("multer")
# coffee 缓存
require('coffee-cache')

config = require("./config")
routeRules = require("./backend/route")
logger = require("./backend/base/log")
render = require("./backend/pageController/render")
app = express()


# 使用ejs解析引擎
app.set "view engine", "jade"

# 视图文件都在/views
app.set "views", path.join(__dirname, "views")

# ~使用压缩~ 换用nginx的压缩服务
# Respense Header:
#      Content-Encoding:gzip
# compress() should have been included **Before** the static file server
# app.use( compress() );

# morgan log出所有的http请求
app.use morgan("dev")  if config.env is "dev"

# 参数解析, 文件上传
app.use bodyParser()
app.use multer(dest: config.uploadTmp)

# cookie 解析
app.use cookieParser()

# 默认的js css等静态资源根目录
# ~添加缓存控制~ maxAge会导致浏览器不发出检查变更的请求,不添加该resHead
# var cacheTime = 7*24*60*60*1000;
# app.use( express.static( __dirname + '/public', { maxAge: cacheTime}) ) ;
app.use express.static(__dirname + "/public")
routeRules.bind app

#if( config.env === 'dev' ){
# error handler by express
app.use (err, req, res, next) ->
  if err
    logger.error err
    if req.path.indexOf("/app") is 0
      res.json
        code: err.code or "500"
        msg: err
    else
      render[500]( res, {
          message: err.message,
          error: err
      } );
      # res.redirect "/#{err.code or '500'}"
  else
    next()
  return


#}
#else if( config.env === 'pro' ){
#    app.use(function(err, req, res, next) {
#        res.status(err.status || 500);
#        render[500]( res, {
#            message: err.message,
#            error: {}
#        });
#    });
#}
app.listen config.port, () ->
  logger.info "app is listeing @ : " + config.port
  console.timeEnd timerStr

  # stack = app._router.stack
  # countArr = [0..app._router.stack.length-1]
  # for n in countArr
  #   logger.info stack[n]
  #   logger.info stack[n].route?.path
  #   logger.info stack[n].handle.name
