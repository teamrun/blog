fs = require("fs")
path = require("path")
jade = require("jade")
logger = require("../base/log")
config = require("../../config")
viewPathSet =
  helper: path.resolve(config.viewPath, "helper")
  viewer: path.resolve(config.viewPath)
  error: path.resolve(config.viewPath, "error")
  partial: path.resolve(config.viewPath, "partial")

pages =
  index: "index.jade"
  photo: "photo.jade"
  post: "post.jade"
  dashboard: "dashboard.jade"
  404: "error/404.jade"
  500: "error/500.jade"

compiledJade = {}
compileOption = filename: viewPathSet.helper
render = {}
done = 0
all = undefined

# res发送html字符串
sendPage = (res, html) ->
  res.end html
  return


# 通过map实现每个页面渲染func的生成
compileRenderService = ->
  done = 0
  all = 0

  for name of pages
    preCompile path.join(viewPathSet.viewer, pages[name]), name
    all++
  return

preCompile = (filePath, pageName) ->
  # fs.readFile( path.join( viewPathSet.viewer, p+'.jade' ), function( err, jadeStr ){
  fs.readFile filePath, (err, jadeStr) ->
    if err
      logger.err "read jade file err: " + filePath + ".jade"
    else
      compiledJade[pageName] = jade.compile(jadeStr, compileOption)
      render[pageName] = (res, data) ->
        html = compiledJade[pageName](data)
        sendPage res, html

      done++
      console.timeEnd "\tre compile jade views"  if done >= all


console.time "\tre compile jade views"
compileRenderService()

# 判断环境
envStr = fs.readFileSync(path.join(__dirname, "../../public/dist/version.js"), "utf-8")
if envStr.indexOf("env: 'dev'") >= 0
  logger.info "developing..."
  for key of viewPathSet
    fs.watch viewPathSet[key], ->
      console.time "\tre compile jade views"
      compileRenderService()


#    logger.info( 'production...' );
module.exports = render
