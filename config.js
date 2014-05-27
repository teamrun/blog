var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var _ = require('underscore')

var env = 'dev';

var HomePath = process.env[(process.platform =='win32')?'USERPROFILE':'HOME'];

var config = {
    env: env,
    port: 3000,
    dburl: 'mongodb://localhost/blog',
    // dburl: 'mongodb://chenllos.com/blog',
    // 两类请求的基础路径..
    apiBase: '/app',
    pageBase: '',
    // 视图文件路径
    viewPath: './views',
    // 上传临时文件夹
    uploadTmp: './uploaded',

    notAllow: ['']
};

var envConfig = {
    dev: {
        photoLib: path.join( HomePath, './Pictures/blogPhoto' )
    },
    pro: {
        photoLib: path.join( HomePath, './blogPhoto' )
    }
};

_.extend( config, envConfig[env] );

mkdirp.sync( config.photoLib )
mkdirp.sync( config.uploadTmp )

module.exports = config;