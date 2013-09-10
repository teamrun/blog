var express = require('express');

var config = require('./Base/config');

var route = require('./route');

var app = express();


app.use(express.bodyParser());
app.use(express.cookieParser());

route.bind( app );

app.listen( config.port );

console.log( 'app is listeing @ : ' + config.port );


console.log( "app is listening at this port: " + config.port );