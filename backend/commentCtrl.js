

var dbo = require('./dbo.js');
var config = require('./config');
var Valid = require('./valid');

var commentCtrl = {
	create: function newComment( req, res ){
		var commentObj = {
			title: req.body.title,
			content: req.body.content,
			dt_create: new Date(),
			from: req.body.from || '',
			to: req.body.to,
			base_article: req.body.base_article,
			base_cmt: req.body.base_cmt
		};

		var newCmt = new dbo.Comment( commentObj );
		newCmt.save( function(err,data){
			var resObj = {};
			if( err ){
				resObj.code = 500;
				resObj.msg = 'failed write into db';
				res.send( resObj );
			}
			else{
				resObj.code = 200;
				resObj.msg = 'cmt created suc';
				res.send( resObj );
			}
		});

		return false;
	},

	getByBase: function getCommentByBase( req, res ){

	}
};

module.exports = commentCtrl;