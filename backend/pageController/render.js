var fs = require('fs');
var path = require('path');

var jade = require('jade');

var logger = require('../base/log');
var config = require('../../config');

var viewPathSet = {
    helper: path.resolve( config.viewPath, 'helper'),
    viewer: path.resolve( config.viewPath ),
    error: path.resolve( config.viewPath, 'error'),
    partial: path.resolve( config.viewPath, 'partial')
};

// logger.debug( viewPathSet.helper );

function sendPage( res, html ){
    res.end( html );
}

// var pages = ['index', 'photo', 'post', 'error/404'];

var pages = {
    index: 'index.jade',
    photo: 'photo.jade',
    post: 'post.jade',
    dashboard: 'dashboard.jade',
    '404': 'error/404.jade'
}

var compiledJade={}, compileOption = { filename: viewPathSet.helper };
var render = {}, done=0, all;
    
console.time('\tre compile jade views');

// 通过map实现每个页面渲染func的生成
function compileRenderService(){
    done = 0, all=0;
    for( var name in pages ){
        preCompile( path.join( viewPathSet.viewer, pages[name]), name );
        all++;
    }
}

function preCompile( filePath, pageName ){
    // fs.readFile( path.join( viewPathSet.viewer, p+'.jade' ), function( err, jadeStr ){
    fs.readFile( filePath, function( err, jadeStr ){
        if( err ){
            logger.err( 'read jade file err: ' + p + '.jade');
        }
        else{
            compiledJade[ pageName ] = jade.compile( jadeStr, compileOption );
            render[ pageName ] = function( res, data ){
                var html = compiledJade[pageName]( data );
                sendPage( res, html );
            };
            done++;
            if( done >= all ){
                console.timeEnd('\tre compile jade views');
            }
        }
    } );
}

compileRenderService();

// 判断环境
var envStr = fs.readFileSync( path.join( __dirname, '../../public/dist/version.js' ), 'utf-8' );

if( envStr.indexOf("env: 'dev'") >=0 ){
    logger.info( 'developing...' );

    for( var key in viewPathSet ){
        fs.watch( viewPathSet[key], function(){
            console.time('\tre compile jade views');
            compileRenderService();
        } );
    }

}
else{
//    logger.info( 'production...' );
}


module.exports = render;
