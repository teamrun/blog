var express = require('express');
// var socket = require('socket.io');

var config = require('./Base/config');

var route = require('./route');

var app = express();


app.use(express.bodyParser());
app.use(express.cookieParser());

route.bind( app );

app.listen( config.port );


console.log( 'app is listeing @ : ' + config.port );



// var server = require('http').createServer( app ),
// io = require('socket.io').listen(server);
// server.listen( config.port );

// io.sockets.on('connection', function( socket ){
//     console.log('a new connection established');

//     socket.emit('welcome',{ text: 'hello, you ~'});

//     socket.on('fileBinary', function( data ){
//         console.log('---------------------------');
//         console.log( data );
//     });

//     socket.on('ping', function(data){
//         console.log( data );
//         socket.emit('pong', {text: 'yes, i am here'});
//     });

// });

