var fs = require('fs')

var dbo = require('../base/dbo.js');
var logger = require('../base/log');
var config = require('../../config');
var Valid = require('../base/valid');
var _ = require('underscore')

var PhotoHelper = {
    savePhotoFile: function( fileTmpPath ){
        fs.readFile( fileTmpPath, function( err, data ){
            if( err ){
                logger.error('unable to read uploaded file...');
                throw( new Error() )
            }
            else{

            }
        } )
    },
    savePhotoEncode: function( base64Str ){
        // get file type
        // get pure base64 codes
        // write file
    },
    encoding2file: function( filePath, data, callback ){
        // encoding 为data的格式, 是读取的文件的base64编码
        fs.writeFile( filePath, data, {encoding: 'base64'}, function( err ){
            console.log( arguments );
        } )
    }
};

var PhotoMeta = {};

var PhotoAPI = {
    upload: function( req, res ){
        console.log( req.files );

        // 测试抛出错误
        // var next = arguments[2];
        // next( new Error('Something went wrong :-(') );
        
        // res.json( _.extend({code: 200, msg: 'good~'}, req.files) );
        // 照片可通过 文件 / base64编码 上传
        // var uploadType = req.body.type;
        // if( uploadType === 'file' ){

        // }
        // else if( uploadType === 'base64' ){

        // }


    }
};

exports.PhotoAPI = PhotoAPI
exports.PhotoMeta = PhotoMeta;