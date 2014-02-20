var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var scriptPath = './public/script',
    destPath = './public/dist';

gulp.task( 'concat-min-avalon', function(){
    gulp.src( [scriptPath+ '/3rdpartylib/avalon.js', scriptPath+ '/common/avalon.extend.js'] )
        .pipe( concat('avalon.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
});

gulp.task( 'concat-min-jquery-all', function(){
    gulp.src( [scriptPath+ '/3rdpartylib/jquery-*.js', scriptPath+ '/3rdpartylib/jquery.*.js'] )
        .pipe( concat('jquery.all.js') )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
});

gulp.task( 'min-showdown-prism', function(){
    gulp.src(  scriptPath+ '/3rdpartylib/showdown_prism.js' )
        .pipe( uglify() )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
});

gulp.task('move-js', function(){
    gulp.src( [scriptPath+'/3rdpartylib/sea.js', scriptPath+'/3rdpartylib/html5shiv.min.js' ]  )
        .pipe( gulp.dest( destPath+'/3rdpartylib') );
});






gulp.task('default', ['concat-min-avalon', 'concat-min-jquery-all', 'min-showdown-prism', 'move-js'], function(){
    // place code for your default task here
});

gulp.task( 'local',  ['concat-min-avalon', 'concat-min-jquery-all', 'min-showdown-prism', 'move-js'], function(){
    // place code for your default task here
});