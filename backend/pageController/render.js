var fs = require('fs');
var path = require('path');

var jade = require('jade');

var logger = require('../base/log');

var viewPathSet = {
    helper: path.join( __dirname, '../../views/helper'),
    viewer: path.join( __dirname, '../../views'),
    error: path.join( __dirname, '../../views/error/'),
    partial: path.join( __dirname, '../../views/partial/')
};

// logger.debug( viewPathSet.helper );

function sendPage( res, html ){
    res.end( html );
}

var pages = ['index', 'photo', 'post', 'error/index'];
var compiledJade={}, compileOption = { filename: viewPathSet.helper };
var render = {};
    
console.time('\tre compile jade views');
// 通过map实现每个页面渲染func的生成
function constructCompileFunc(){
    var done = 0, all = pages.length;
    pages.map( function( p ){
        // render[p] = function(){};
        fs.readFile( path.join( viewPathSet.viewer, p+'.jade' ), function( err, jadeStr ){
            if( err ){
                logger.err( 'read jade file err: ' + p + '.jade');
            }
            else{
                compiledJade[ p ] = jade.compile( jadeStr, compileOption );
                render[ p ] = function( res, data ){
                    var html = compiledJade[p]( data );
                    sendPage( res, html );
                };
                done++;
                if( done >= all ){
                    console.timeEnd('\tre compile jade views');
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

    for( var key in viewPathSet ){
        fs.watch( viewPathSet[key], function(){
            console.time('\tre compile jade views');
            constructCompileFunc();
        } );
    }

}
else{
//    logger.info( 'production...' );
}


module.exports = render;
