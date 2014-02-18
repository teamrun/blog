var express = require('express');
var path = require('path');
var ejs = require('ejs');

var config = require('./backend/Base/config');
var route = require('./backend/route');

var app = express();


// 使用ejs解析引擎
app.set('view engine', 'ejs');

// 视图文件都在/views


app.use(express.bodyParser());
app.use(express.cookieParser());
// 默认的js css等静态资源根目录
app.use(express.static( __dirname + '/public'));


route.bind( app );
app.listen( config.port );


console.log( '\napp is listeing @ : ' + config.port );
