var fs = require('fs');
var path = require('path');

var jade = require('jade');

var logger = require('../base/log');

var helperPath = path.join( __dirname, '../../views/helper');
var viewerPath = path.join( __dirname, '../../views');
logger.debug( helperPath );

function sendPage( res, html ){
    res.end( html );
}

var pages = ['index', 'photo', 'post'];
var compiledJade={}, compileOption = { filename: helperPath };
var render = {};

// 通过map实现每个页面渲染func的生成
    function constructCompileFunc(){
        var done = 0, all = pages.length;
        pages.map( function( p ){
            // render[p] = function(){};
            fs.readFile( path.join( viewerPath, '/index.jade' ), function( err, jadeStr ){
                if( err ){
                    logger.err( 'read jade file err: ' + p + '.jade');
                }
                else{
                    compiledJade[ p ] = jade.compile( jadeStr, compileOption );
                    render[ p ] = function( res, data ){
                        sendPage( res, compiledJade[ p ]( data ) );
                    };
                    done++;
                    if( done >= all ){
                        logger.debug('render function constructed ...');
                    }
                }
            } );
        } );
    }

constructCompileFunc();

// 判断环境
var envStr = fs.readFileSync( path.join( __dirname, '../../public/dist/version.js' ), 'utf-8' );
logger.debug( typeof envStr );
// debugger;
if( envStr.indexOf("env: 'dev'") >=0 ){
    logger.info( 'developing...' );

    fs.watch( viewerPath, function(){
        logger.debug('viewer changed, re constructing render ...');
        constructCompileFunc();
    } );
    fs.watch( helperPath, function(){
        logger.debug('helper changed, re constructing render ...');
        constructCompileFunc();
    } );

}
else{
//    logger.info( 'production...' );
}


module.exports = render;