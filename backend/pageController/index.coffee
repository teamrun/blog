fs = require("fs")
path = require("path")
EventProxy = require("eventproxy")
jade = require("jade")

# new nd parser, based on showdown
md2html = require("node-markdown").Markdown

# old nd parser
# var md2html = require( "markdown" ).markdown.toHTML;
config = require("../../config")
logger = require("../base/log")
render = require("./render")

blogMeta = require("../apiController/blogCtrl").BlogMeta
cmtMeta = require("../apiController/commentCtrl").CommentMeta
PhotoPageCtrl = require("./photo")

errorHandling = require("./error")

viewPath = path.resolve(__dirname, "../../views")



doubleDigit = (n) ->
  return if n < 10 then String("0" + n)  else n

time = (dateObj) ->
  d = dateObj
  year = d.getFullYear()
  month = d.getMonth() + 1
  date = d.getDate()
  h = d.getHours()
  m = d.getMinutes()
  year + "-" + doubleDigit(month) + "-" + doubleDigit(date) + " " + doubleDigit(h) + ":" + doubleDigit(m)
md = (str) ->
  md2html str
sendPostList = (req, res) ->
  blogMeta._getSome (postList) ->
    data =
      title: "chenllos的博客"
      posts: postList
      mdFilter: md

    render.index res, data

sendSpecificPost = (req, res, next) ->
  postID = req.param("id")
  blogMeta._getThePost postID, (err, postModel) ->
    if err
      next err
    else
      unless postModel
        render["error/404"] res,
          route: "sendSpecificPost"
        return false
      data ={
        title: postModel.title
        art: postModel
        timeFilter: time
        mdFilter: md
      }
      render.post res, data


sendDashBoard = (req, res) ->
  render.dashboard res, {}

ErrorPage =
  404: (req, res) ->
    render[404] res, {}

  500: (req, res) ->
    render[500] res, {}


exports.postsList = sendPostList
exports.thePost = sendSpecificPost
exports.Photo = PhotoPageCtrl
exports.dashboard = sendDashBoard
exports["404"] = ErrorPage[404]
exports["500"] = ErrorPage[500]
