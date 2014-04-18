var dbo = require('../base/dbo.js');
var logger = require('../base/log');
var config = require('../config');
var Valid = require('../base/valid');

var titleReg = new RegExp( /#+.+\n+/);
var imgReg = new RegExp(/\!\[.+\]\(.+\)/);
var mongoIdReg = /[0-9a-zA-Z]{24}/;


// console.log( dbo );

function getSummaryText( AllBlog ){
    var justContent = AllBlog.replace(titleReg, '');
    var Summary;
    var contentLength = justContent.length;
	if( contentLength < 120 ){
		Summary = justContent.substr(0, contentLength/2);
	}
	else if( contentLength < 240 ){
		Summary = justContent.substr(0, contentLength/3);
	}
	else if( contentLength < 400 ){
		Summary = justContent.substr(0, contentLength/4);
	}
	else if( contentLength < 600 ){
		Summary = justContent.substr(0, contentLength/5);
	}
	else{
		Summary = justContent.substr(0, contentLength/10);
	}

	return Summary;
}

function blogErrHandler( funcName, err ){
	logger.error( funcName + ': error occured ');
	logger.error(  err );
}

function mongoIdFilter( id ){
    return mongoIdReg.test( id );
}

var blogMeta = {
	_getSome: function( callback ){
		dbo.Blog.find({},'_id title summary author dt_create dt_modify location like comment tag').sort({dt_modify: 'desc'}).exec( function( err, data ){
			if( !err ){
				callback( data );
			}
			else{
				blogErrHandler( arguments.callee, err );
			}
		});
	},
	_getThePost: function( postsID, callback ){
        if( !mongoIdFilter(postsID) ){
            callback( 'no legal id!', undefined );
            return;
        }
		dbo.Blog.findById( postsID, function(err, data){
			if( !err ){
				callback( null, data );
			}
			else{
                callback( 'query db err', undefined );
				blogErrHandler( arguments.callee, err );
			}
		} );
	}
};

var blogCtrl = {
	// fucntion声明时的名称并没有用,在定义的作用域中调用还是会报undefined错误,  此处写上名字只是为了可以在函数内部调用callee时可以有function name
	create: function newBlog(req, res){

		var reqContent = req.body.content;

		var blogTitle = req.body.title;
		var SummaryObj = {};
		SummaryObj.text = getSummaryText( reqContent );
		SummaryObj.img = reqContent.match( imgReg );
		var blogObj = {
			title: blogTitle,
			content: reqContent,
			summary: SummaryObj,
			dt_create: new Date(),
			dt_modify: [new Date()],
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

	getSummary: function getBlogSummary( req, res ){

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
			blogMeta._getSome( function(err){
				res.send( data );
			} );
		}

		return false;
		
	},

	// TODO 读者点击blog标题后,由于网络传输速度和数据库查询,会有一定的延迟,所以最还加个loading
	// 考虑好在哪里加,在Timeline的点击事件里加, 还是在具体的获取函数处添加
	// loading函数接收dom对象, 结合css的class实现,应该是最优的方法
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
    },

    updateOne: function updateOne( req, res ){
//		var updateFields = req.body.updateFields;
		var updateFields = req.param('updateFields');
//		var updateValues = req.body.updateValues;
		var updateValues = req.param('updateValues');
		var blogID = req.params.id;
		if( !(updateFields instanceof Array) || updateFields.length > 0 ){
			res.send({
				code: 322,
				msg: 'wrong updateFields: not array or length 0'
			});
			return false;
		}
		if( !(updateValues instanceof Array) && updateValues.length > 0){
			res.send({
				code: 322,
				msg: 'wrong updateValues: not array or length 0'
			});
			return false;
		}
		if( blogID && blogID.length === 24 ){
			var updates = {};

			var updateFieldsCount = updateFields.length;
			for( var i=0; i< updateFieldsCount; i++){
				if( updateFields[i] && updateValues[i] !== undefined ){
					updates[ updateFields[i] ] = updateValues[i];
				}
			}
			dbo.Blog.update({id: blogID}, updates, function(err, data){
				logger.debug( data );
				logger.debug( err );
			} );
		}
		else{
			res.send({
				code: 322,
				msg: 'wrong blogid: not an id'
			});
			return false;
		}
        return false;
    }


};

var promiseBlogCtrl = {};


exports.BlogMeta = blogMeta;
exports.BlogAPI = blogCtrl;
// module.exports = promiseBlogCtrl;