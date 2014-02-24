var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    less = require( 'gulp-less' ),
    changed = require('gulp-changed');

var scriptPath = './public/script',
    destPath = './public/dist';



gulp.task( 'stable-files', function(){
    console.log( '    gonna do these works:' );
    console.log( '\t concat-min-avalon' );
    gulp.src( [scriptPath+ '/3rdpartylib/avalon.js', scriptPath+ '/common/avalon.extend.js'] )
        .pipe( changed( destPath ) )
        .pipe( concat('avalon.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    console.log( '\t concat-min-jquery-all' );
    gulp.src( [scriptPath+ '/3rdpartylib/jquery-*.js', scriptPath+ '/3rdpartylib/jquery.*.js'] )
        .pipe( changed( destPath ) )
        .pipe( concat('jquery.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    console.log( '\t min-showdown-prism' );
    gulp.src(  scriptPath+ '/3rdpartylib/showdown_prism.js' )
        .pipe( changed( destPath ) )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );

    console.log('\t move-js');
    gulp.src( [scriptPath+'/3rdpartylib/sea.js', scriptPath+'/3rdpartylib/html5shiv.min.js' ]  )
        .pipe( changed( destPath ) )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
});


gulp.task('compile-less', function(){
    gulp.src( './public/layout/less/layout*.less' )
        // .pipe(  less( { paths: ['./public/layout/css'] } )  )
        .pipe(  less( {compress: true} )  )
        .pipe( gulp.dest('./public/layout/css') );
});






gulp.task('default', [ 'stable-files', 'compile-less'], function(){
    // place code for your default task here
});

gulp.task( 'local',  ['stable-files', 'compile-less'], function(){
    // place code for your default task here
});