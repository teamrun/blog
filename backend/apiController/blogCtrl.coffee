dbo = require("../base/dbo")
logger = require("../base/log")
config = require("../../config")
Valid = require("../base/valid")

TITLE_REG = new RegExp(/#+.+\n+/)
IMG_REG = new RegExp(/\!\[.+\]\(.+\)/)
MONGO_ID_REG = /[0-9a-zA-Z]{24}/

# util
getSummaryText= (AllBlog) ->
  justContent = AllBlog.replace(TITLE_REG, '')
  Summary = undefined
  contentLength = justContent.length
  Summary = switch
    when contentLength < 120 then justContent.substr(0, contentLength/2)
    when contentLength < 240 then justContent.substr(0, contentLength/3)
    when contentLength < 400 then justContent.substr(0, contentLength/4)
    when contentLength < 600 then justContent.substr(0, contentLength/5)
    else justContent.substr(0, 200);

blogErrHandler = (funcName, err) ->
  logger.error "error occured at: #{funcName}"
  logger.error err

mongoIdFilter = (id) ->
  MONGO_ID_REG.test( id )

# 基础数据处理
blogMeta = {
  _getSome: (callback) ->
    dbo.Blog.find({},'_id title summary author dt_create dt_modify location like tag')
    .sort({dt_modify: 'desc'}).exec( (err, data) ->
      if not err
        callback data
      else
        blogErrHandler undefined, err
    )
  _getThePost: (postsID, callback) ->
    # 非法的id直接return
    if not mongoIdFilter(postsID)
      return callback( {msg: 'no legal id!', code: 404}, undefined );

    dbo.Blog.findById( postsID, (err, data) ->
      if not err
        callback( null, data )
      else
        callback( 'query db err', undefined )
        blogErrHandler( arguments.callee, err )
    )
}

# 封装好的api
blogAPI = {
  create: (req, res) ->
    reqContent = req.body.content

    blogTitle = req.body.title
    SummaryObj = {}
    SummaryObj.text = getSummaryText( reqContent )
    SummaryObj.img = reqContent.match( IMG_REG )
    blogObj =
      title: blogTitle
      content: reqContent
      summary: SummaryObj
      dt_create: new Date()
      dt_modify: [new Date()]
      author: req.body.author or 'chenllos'
      location: req.body.location
      like: 0
      comment: 0
      tag: req.body.tags

    blogEntity = new dbo.Blog(blogObj)

    blogEntity.save( (err, data) ->
      if err
        # do sth
      else
        resObj = {
          code: 200,
          msg: 'new a blog success!',
          blog: data
        }
        res.send( resObj )
    )

  getSummary: (req, res) ->
    # do sth
  getSome: (req, res) ->
    if req.query.key
      query = {}
      query[ req.query.key ] = req.query.value
      dbo.Blog.find(query,(err, data) ->
        if not err
          res.send( data )
      )
    else
      blogMeta._getSome( (err) ->
        res.send( data )
      )
  getById: (req, res) ->
    query = {}
    query[ '_id' ] = req.params.id
    dbo.Blog.findById( req.params.id, ( err, data ) ->
      if not err
        res.send( data )
      else
        # do sth
    )
  updateOne: (req, res) ->
    # still working on this

}


promiseBlogCtrl = {}


exports.BlogMeta = blogMeta
exports.BlogAPI = blogAPI