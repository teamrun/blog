fs = require("fs")
path = require("path")

EventProxy = require("eventproxy")
mongoose = require("mongoose")

config = require("../../config")

Blog = undefined
Comment = undefined
connect = mongoose.connect(config.dburl)
	
# 
#	 * 标题, 别名(纯英文的, 方便url, 但是不必要),作者
#	 * 内容, 摘要, 标签
#	 * 
#	 * 创建日期, 最近修改日期
#	 * 写作地点
#	 * 赞数, 评论数
#	 * 
#	 
blogSchema = mongoose.Schema(
  title: String
  alias: String
  author: String
  content: String
  summary: Object
  tag: Array
  dt_create: Date
  dt_modify: Array
  location: Object
  like: Number
  comment: Number
)

# 标题，内容，评论人，评论谁， 基于哪篇文章
commentSchema = mongoose.Schema(
  title: String
  content: String
  dt_create: Date
  commenter: String
  commenter_email: String
  commenter_site: String
  to: String
  base_article: String
  base_cmt: String
)

# subcom

#
#	 * 
#	 * 
#	 * 
#	 * 
#	 * 
#	 
photoSchema = mongoose.Schema(
  event: String
  title: String
  
  # title之外的说明文字
  intro: String
  
  # path.join( photoLib, src ) to find the photo file and res back
  src: String
  majorColor: String
  dt_create: Date
  dt_modify: Array
  exif: Object
  like: Number
)



Blog = mongoose.model("blog", blogSchema)
Comment = mongoose.model("comment", commentSchema)
Photo = mongoose.model("photo", photoSchema)


# importTestData();
importTestData = ->
  # nodejs中"./"的路径指示的是执行node app.js的路径```
  logger.debug __dirname
  logger.debug path.resolve("./")
  fs.readFile "./backend/Base/database.json", "utf-8", (err, data) ->
    if err
      logger.error err

    blogArr = JSON.parse(data)
    count = blogArr.length
    ep = new EventProxy()
    ep.after "save test data", count, (list) ->
      loger.debug list

    i = 0

    while i < count
      blogArr[i].dt_create = new Date()
      blogArr[i].dt_modify = [new Date()]
      tmpBlog = new Blog(blogArr[i])
      tmpBlog.save (err) ->
        saveCB err, tmpBlog, ep

      i++

saveCB = (err, blogObj, ep) ->
  result = {}
  result.title = blogObj.title
  if err
    result.blSaved = false
  else
    result.blSaved = true
  ep.emit "save test data", result



exports.Blog = Blog
exports.Comment = Comment
exports.Photo = Photo