

var dbo = require('./dbo.js');
var config = require('./config');
var Valid = require('./valid');

var titleReg = new RegExp( /#+.+\n/);
var imgReg = new RegExp(/\!\[.+\]\(.+\)/);

function getSummery( content ){
	var summery;
	if( content.length < 120 ){
		summery = content.substr(0, content.length/2);
	}
	else if( content.length < 240 ){
		summery = content.substr(0, content.length/3);
	}
	else if( content.length < 400 ){
		summery = content.substr(0, content.length/4);
	}
	else if( content.length < 600 ){
		summery = content.substr(0, content.length/5);
	}
	else{
		summery = content.substr(0, content.length/10);
	}

	return summery;
}

var blogCtrl = {
	create: function newBlog(req, res){

		var reqContent = req.body.content;

		var blogTitle = reqContent.match( titleReg )[0];
		var summeryObj = {};
		summeryObj.text = getSummery( reqContent );
		summeryObj.img = reqContent.match( imgReg )[0];
		var blogObj = {
			title: blogTitle,
			content: reqContent,
			summery: summeryObj,
			dt_create: new Date(),
			dt_modify: new Date(),
			author: req.body.author || 'chenllos',
			location: req.body.location,
			like: 0,
			comment: 0,
			tag: req.body.tags
		};


		var blogEntity = new dbo.Blog(blogObj);

		blogEntity.save(function(err, data){
			if( err ){
			}
			else{
				var resObj = {
					code: 200,
					msg: 'new a blog success!',
					blog: data
				};

				res.send( resObj );
			}
		});

		return false;
	},

	getSummery: function getBlogSummery( req, res ){

	},

	getSome: function getSomeBlog(req, res ){

		if( req.query.key ){
			var query = {};
			query[ req.query.key ] = req.query.value;

			dbo.Blog.find( query, function( err, data ){
				if( !err ){
					res.send( data );
				}
				else{
				}
			});
		}
		else{
			dbo.Blog.find({},'_id title summery author dt_create dt_modify location like comment tag').limit(3).exec( function( err, data ){
				if( !err ){
					res.send( data );
				}
				else{
				}
			});
		}

		return false;
		
	},

	getById: function getBlogById(req, res ){
		// var identifor = req.query.key;
		var query = {};

		query[ '_id' ] = req.params.id;
		dbo.Blog.findById( req.params.id, function( err, data ){
			if( !err ){
				res.send( data );
			}
			else{

			}
		});
        return false;
    }


};

var promiseBlogCtrl = {};


module.exports = blogCtrl;
// module.exports = promiseBlogCtrl;