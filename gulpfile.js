var path = require('path');

var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var less = require( 'gulp-less' );
var changed = require('gulp-changed');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var cond = require('gulp-cond');
var seajs = require( 'gulp-seajs' );

var liveReload = require('gulp-livereload');


var scriptPath = './public/script',
    destPath = './public/dist';


var blogWatchPort = 3003;
var scriptTagToReplace = /script\(id\="livereload\-script".+/;
var liveReloadScript = 'script(id="livereload-script" src="http://127.0.0.1:3003/livereload.js?ext=Chrome&extver=2.0.9")';
var liveReloadTag = 'script(id="livereload-script")';

// config *------------*------------*------------*------------

    var proEnv = false;
    var taskName = process.argv[2];
    var proTasks = [undefined, 'default', 'deploy', 'pro', 'tpro'];
    if( proTasks.indexOf( taskName ) >=0 ){
        proEnv = true;
    }
    var pwd = path.resolve('./');

    var src3rd = scriptPath+'/3rdpartylib';

    var Conf = {
        less: {
                file: ['./public/layout/less/layout*.less', './public/layout/less/fuck*.less'],
                watch: ['./public/layout/less/*.less', './public/layout/less/**/*.less'],
                dest: './public/layout/css'
            },
        jade: {
                watch: ['./views/*.jade', './views/**/*.jade']
            },
        concat: {
                file: {
                    'avalon.all.js': [src3rd+'/avalon.js', src3rd+'/avalon.extend.js'],
                    'jquery.all.js': [src3rd+'/jquery-*.js', src3rd+'/jquery.*.js'],
                    'showdown_prism.js': [ src3rd+'/showdown.js', src3rd+'/prism.js']
                },
                watch: [ src3rd+ '/*.js', src3rd+ '/**/*.js' ],
                dest: destPath+'/script/3rdpartylib'
            },
        mv: {
                file: [src3rd+'/sea.js', src3rd+'/html5shiv.min.js' ],
                dest: destPath+'/script/3rdpartylib'
            },
        version: {
                pro: './public/script/config/version_product.js',
                dev: './public/script/config/version_dev.js',
                dest: destPath
            },
        seajs: {
                file: {
                    '/dist/script/controller/blogCtrl.js': './public/script/controller/blogCtrl.js'
                },
                dest: destPath+'/script/controller'
            }
    };



// endof config *------------*------------*------------*------

gulp.task('changeEnv', function(){
    gulp.src('./config.js' )
        .pipe( cond( proEnv,
            replace( /var\ env\ \= .+/, 'var env = \'pro\';'),
            replace( /var\ env\ \= .+/, 'var env = \'dev\';' )
            )
        )
        .pipe( gulp.dest( './' ) );
});

gulp.task('less', function(){
    gulp.src( Conf.less.file )
        .pipe(  cond( proEnv,
            less({compress:true}),
            less({dumpLineNumbers:'comments'})
        ) )
        .pipe( replace(pwd, '') )
        .pipe( gulp.dest( Conf.less.dest ) );
});

gulp.task( 'third', function(){
    
    for( var name in Conf.concat.file ){
        gulp.src( Conf.concat.file[name] )
            .pipe( concat( name ) )
            .pipe( cond( proEnv, uglify()) )
            .pipe( gulp.dest( Conf.concat.dest ) );
    }

    gulp.src( Conf.mv.file )
        .pipe( gulp.dest(Conf.mv.dest) );
});

gulp.task('version', function(){
    var versionFile = proEnv? Conf.version.pro : Conf.version.dev;
    gulp.src( versionFile )
        .pipe( replace( /[0-9|-]+/, Date.now() ) )
        .pipe( rename( 'version.js') )
        .pipe( gulp.dest(destPath) );
});

gulp.task('seajs', function(){
    for( var moduleID in Conf.seajs.file ){
        gulp.src( Conf.seajs.file[moduleID] )
            .pipe( seajs( moduleID ) )
            .pipe( cond( proEnv, uglify()) )
            .pipe( gulp.dest( Conf.seajs.dest ) );
    }
});

gulp.task('lr', function(){
    gulp.src('views/helper/base.jade')
        .pipe( cond( proEnv,
            replace(scriptTagToReplace,liveReloadTag),
            replace(scriptTagToReplace,liveReloadScript) 
        ) )
        .pipe( gulp.dest('views/helper/') );
});

gulp.task('watch', function(){
    var lr = liveReload( blogWatchPort );

    gulp.watch( Conf.less.watch, ['less']);
    gulp.watch( Conf.less.dest+'/*.css', function( file ){
        lr.changed( file.path );
    });

    // watch jade --------------------------------------------------------
    gulp.watch( Conf.jade.watch, function( file ){
        console.log( file.path )
        // jade file 没有在页面上的映射, 所以会导致全面刷新
        // timeout是为了给app中jade编译留时间
        setTimeout( function(){
            lr.changed( file.path );
        }, 800 );
    });

    // watch stable js ----------------------------------------------------
    gulp.watch( [scriptPath+ '/3rdpartylib/*.js', scriptPath+ '/3rdpartylib/**/*.js' ], ['stable-files'] );
});


gulp.task('all', [ 'changeEnv', 'less', 'third', 'version', 'seajs', 'lr'] )

gulp.task('default', [ 'all'] );

gulp.task( 'dev',  [ 'all' ] );

gulp.task( 'wd',  [ 'all', 'watch' ] );


gulp.task('test', [ 'all' ]);
gulp.task('tpro', [ 'all' ]);