url = require("url")
logger = require("./base/log")
config = require("../config")
BlogAPI = require("./apiController/blogCtrl").BlogAPI
CommentAPI = require("./apiController/commentCtrl").CommentAPI
PhotoAPI = require("./apiController/photoCtrl").PhotoAPI
pageRoute = require("./pageController")
apiBaseUrl = config.apiBase
pageBaseUrl = config.pageBase




bindRoute = (app) ->
  logger.info "server started at:"
  logger.info (new Date())
  logger.debug "api routing >-------->-------->-------->---------"
  bindByRuleSet app, apiRouteList, apiBaseUrl
  logger.debug "page routing >-------->-------->-------->---------"
  bindByRuleSet app, pageRouteList, pageBaseUrl
  return
bindByRuleSet = (app, routeRuleSet, baseUrl) ->
  apiCount = routeRuleSet.length
  i = 0

  while i < apiCount
    routeIterm = routeRuleSet[i]
    routeIterm.url = baseUrl + routeRuleSet[i].url
    app[routeIterm.action] routeIterm.url, routeIterm.handler
    switch routeIterm.action
      when "get"
        logger.debug "GET:       " + routeIterm.url + "  ->  " + routeIterm.handler.name
      when "put"
        logger.debug "PUT:       " + routeIterm.url + "  ->  " + routeIterm.handler.name
      when "post"
        logger.debug "POST:      " + routeIterm.url + "  ->  " + routeIterm.handler.name
      when "delete"
        logger.debug "DELETE:    " + routeIterm.url + "  ->  " + routeIterm.handler.name
    i++
  return

apiRouteList = [
  # ------------ BlogAPI的CGUD操作 ------------ 
  {
    action: "post"
    url: "/blog"
    handler: BlogAPI.create
  }
  {
    action: "get"
    url: "/blog"
    handler: BlogAPI.getSome
  }
  {
    action: "get"
    url: "/blog/:id"
    handler: BlogAPI.getById
  }
  {
    action: "put"
    url: "/blog/:id"
    handler: BlogAPI.updateOne
  }
  # ------------ CommentAPI的 CGUD 操作 ------------ 
  {
    action: "post"
    url: "/comment"
    handler: CommentAPI.create
  }
  {
    action: "get"
    url: "/comment"
    handler: CommentAPI.get
  }
  # ------------ Photo 的 CGUD 操作 ------------ 
  {
    action: "post"
    url: "/photo"
    handler: PhotoAPI.upload
  }
]
pageRouteList = [
  # 首页 / postlist
  {
    action: "get"
    url: "/"
    handler: pageRoute.postsList
  }
  # postlist
  {
    action: "get"
    url: "/posts"
    handler: pageRoute.postsList
  }
  # 某个post
  {
    action: "get"
    url: "/posts/:id"
    handler: pageRoute.thePost
  }
  # photo的timeline
  {
    action: "get"
    url: "/photos"
    handler: pageRoute.Photo.sendTimeline
  }
  # 怎样的拼接才是最优雅的~? path / url ?
  {
    action: "get"
    url: config.photoThumbSrc + ":photoSrc"
    handler: pageRoute.Photo.sendPhotoThumb
  }
  {
    action: "get"
    url: "/dashboard"
    handler: pageRoute.dashboard
  }
  # 错误页面
  {
    action: "get"
    url: "/404"
    handler: pageRoute[404]
  }
  {
    action: "get"
    url: "/500"
    handler: pageRoute[500]
  }
]
exports.bind = bindRoute
