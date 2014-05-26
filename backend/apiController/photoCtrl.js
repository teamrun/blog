var dbo = require('../base/dbo.js');
var logger = require('../base/log');
var config = require('../../config');
var Valid = require('../base/valid');
var _ = require('underscore')

var PhotoMeta = {

};

var PhotoAPI = {
    upload: function( req, res ){
        console.log( req.files );
        res.json( _.extend({code: 200, msg: 'good~'}, req.files) );

        if( req.files ){

        }
        
    }
};

exports.PhotoAPI = PhotoAPI
exports.PhotoMeta = PhotoMeta;