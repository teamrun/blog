(function() {
  var BlogAPI, CommentAPI, PhotoAPI, apiBaseUrl, apiRouteList, bindByRuleSet, bindRoute, config, logger, pageBaseUrl, pageRoute, pageRouteList, url;

  url = require("url");

  logger = require("./base/log");

  config = require("../config");

  BlogAPI = require("./apiController/blogCtrl").BlogAPI;

  CommentAPI = require("./apiController/commentCtrl").CommentAPI;

  PhotoAPI = require("./apiController/photoCtrl").PhotoAPI;

  pageRoute = require("./pageController");

  apiBaseUrl = config.apiBase;

  pageBaseUrl = config.pageBase;

  bindRoute = function(app) {
    logger.info("server started at:");
    logger.info(new Date());
    logger.debug("api routing >-------->-------->-------->---------");
    bindByRuleSet(app, apiRouteList, apiBaseUrl);
    logger.debug("page routing >-------->-------->-------->---------");
    bindByRuleSet(app, pageRouteList, pageBaseUrl);
  };

  bindByRuleSet = function(app, routeRuleSet, baseUrl) {
    var apiCount, i, routeIterm;
    apiCount = routeRuleSet.length;
    i = 0;
    while (i < apiCount) {
      routeIterm = routeRuleSet[i];
      routeIterm.url = baseUrl + routeRuleSet[i].url;
      app[routeIterm.action](routeIterm.url, routeIterm.handler);
      switch (routeIterm.action) {
        case "get":
          logger.debug("GET:       " + routeIterm.url + "  ->  " + routeIterm.handler.name);
          break;
        case "put":
          logger.debug("PUT:       " + routeIterm.url + "  ->  " + routeIterm.handler.name);
          break;
        case "post":
          logger.debug("POST:      " + routeIterm.url + "  ->  " + routeIterm.handler.name);
          break;
        case "delete":
          logger.debug("DELETE:    " + routeIterm.url + "  ->  " + routeIterm.handler.name);
      }
      i++;
    }
  };

  apiRouteList = [
    {
      action: "post",
      url: "/blog",
      handler: BlogAPI.create
    }, {
      action: "get",
      url: "/blog",
      handler: BlogAPI.getSome
    }, {
      action: "get",
      url: "/blog/:id",
      handler: BlogAPI.getById
    }, {
      action: "put",
      url: "/blog/:id",
      handler: BlogAPI.updateOne
    }, {
      action: "post",
      url: "/comment",
      handler: CommentAPI.create
    }, {
      action: "get",
      url: "/comment",
      handler: CommentAPI.get
    }, {
      action: "post",
      url: "/photo",
      handler: PhotoAPI.upload
    }
  ];

  pageRouteList = [
    {
      action: "get",
      url: "/",
      handler: pageRoute.postsList
    }, {
      action: "get",
      url: "/posts",
      handler: pageRoute.postsList
    }, {
      action: "get",
      url: "/posts/:id",
      handler: pageRoute.thePost
    }, {
      action: "get",
      url: "/photos",
      handler: pageRoute.Photo.sendTimeline
    }, {
      action: "get",
      url: config.photoThumbSrc + ":photoSrc",
      handler: pageRoute.Photo.sendPhotoThumb
    }, {
      action: "get",
      url: "/dashboard",
      handler: pageRoute.dashboard
    }, {
      action: "get",
      url: "/404",
      handler: pageRoute[404]
    }, {
      action: "get",
      url: "/500",
      handler: pageRoute[500]
    }
  ];

  exports.bind = bindRoute;

}).call(this);
