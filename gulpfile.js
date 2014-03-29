var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    less = require( 'gulp-less' ),
    changed = require('gulp-changed'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename');

var seajs = require( 'gulp-seajs' );

var scriptPath = './public/script',
    destPath = './public/dist';


/* name guide:
 * actions: move concat uglify compile build 
 * 
 * 
 */


gulp.task( 'stable-files', function(){
    gutil.log( 'gonna do these works:' );
    gutil.log( '\t concat-uglify-avalon' );
    gulp.src( [scriptPath+ '/3rdpartylib/avalon.js', scriptPath+ '/common/avalon.extend.js'] )
        .pipe( changed( destPath+'/3rdpartylib' ) )
        .pipe( concat('avalon.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    gutil.log( '\t concat-uglify-jquery-all' );
    gulp.src( [scriptPath+ '/3rdpartylib/jquery-*.js', scriptPath+ '/3rdpartylib/jquery.*.js'] )
        .pipe( changed( destPath+'/3rdpartylib' ) )
        .pipe( concat('jquery.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    gutil.log( '\t uglify-showdown-prism' );
    gulp.src(  scriptPath+ '/3rdpartylib/showdown_prism.js' )
        .pipe( changed( destPath+'/3rdpartylib' ) )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    gutil.log('\t move-js');
    gulp.src( [scriptPath+'/3rdpartylib/sea.js', scriptPath+'/3rdpartylib/html5shiv.min.js' ]  )
        .pipe( changed( destPath+'/3rdpartylib' ) )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
    
});

gulp.task('update-version-product', function(){
    gulp.src( './public/script/config/version_product.js' )
        .pipe( replace( /[0-9|-]+/, Date.now() ) )
        .pipe( rename( 'version.js') )
        .pipe( gulp.dest(destPath) );
});

gulp.task('update-version-dev', function(){
    gulp.src( './public/script/config/version_dev.js' )
        .pipe( replace( /[0-9|-]+/, Date.now().toString() ) )
        .pipe( rename( 'version.js') )
        .pipe( gulp.dest(destPath) );
});

gulp.task('build-seajs', function(){
    gulp.src( './public/script/controller/blogCtrl.js' )
        .pipe( seajs( '/dist/script/controller/blogCtrl.js') )
        .pipe( gulp.dest(destPath+'/script/controller') );
});


gulp.task('compile-less', function(){
    gulp.src( ['./public/layout/less/layout*.less', './public/layout/less/fuck*.less' ] )
        .pipe(  less( {compress: true} )  )
        .pipe( gulp.dest('./public/layout/css') );
});

gulp.task('compile-less-dev', function(){
    gulp.src( ['./public/layout/less/layout*.less', './public/layout/less/fuck*.less'] )
        .pipe(  less( )  )
        .pipe( gulp.dest('./public/layout/css') );
});


var liveReload = require('gulp-livereload');


gulp.task('watch', function(){
    var lr = liveReload();
    
    // 当前目录下的文件
    gulp.watch('./public/layout/less/*.less', ['compile-less-dev']);
    // n(n=1,2,3..)层子目录下的文件 多深都会监控
    gulp.watch('./public/layout/less/**/*.less', ['compile-less-dev']);

    gulp.watch('./public/layout/css/layout.css', function( file ){
        lr.changed( file.path );
    });

    gulp.watch('./public/layout/css/layout-blog.css', function( file ){
        lr.changed( file.path );
    });

    gulp.watch(['./views/*.jade', './views/**/*.jade'], function( file ){
        // jade file 没有在页面上的映射, 所以会导致全面刷新
        // timeout是为了给app中jade编译留时间
        setTimeout( function(){
            lr.changed( file.path );
        }, 800 );
        
    });
});




gulp.task('default', [ 'stable-files', 'update-version-product', 'build-seajs', 'compile-less'], function(){
    // place code for your default task here
});

gulp.task( 'dev',  ['stable-files', 'update-version-dev', 'compile-less-dev', 'watch'], function(){
    // place code for your default task here
});

gulp.task( 'test',  ['compile-less', 'watch'], function(){
    // place code for your default task here
});