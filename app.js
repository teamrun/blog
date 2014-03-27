var express = require('express');
var path = require('path');

var config = require('./backend/config');
var route = require('./backend/route');
var logger = require('./backend/base/log');

var app = express();


// 使用ejs解析引擎
app.set('view engine', 'jade');
// app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
// 视图文件都在/views


app.use(express.bodyParser());
app.use(express.cookieParser());
// 默认的js css等静态资源根目录
app.use(express.static( __dirname + '/public'));


route.bind( app );
app.listen( config.port );


logger.info( 'app is listeing @ : ' + config.port );
