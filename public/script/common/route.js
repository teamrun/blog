define( function( require, exports, module ){

    function matchUrl( urlSet ){

    }

    function clearObj( obj ) {
        for( var i in this ){
            delete obj[i];
        }
    }

    // Router组件, 使用html5的historyAPI, 进行url -> handler的绑定, 然后在调用go方法时, 改变地址, 并(顺序)调用先前绑定的处理函数
    // 改变的是location的pathname, 后期也许会加上hash以兼容IE8和IE9
    // 目前还没有特别实用的urlMatch机制, 有的想法是: 在合适的时间将所有绑定好多的url集进行分类,然后根据/的个数进行match, 同事提取出param, 方便handler访问

    // 使用建议: 在controller中引用, 所谓controller的一个属性, 传递给分属的viewer; 或者再在viewer中分别引入
    // 最下做了简单的示例:

    var Router = function(){
        this.ruleMap = {
            // url:  hanlder,
        };
        this.param = {
            foo: 'bar'
        };
        return this;
    };

    // get the matched rule accoeding to given url
    // parse param from url, both :key and querystring
    Router.prototype.matchUrl = function( url ){
        clearObj( this.param );
        //  repeat....
        for( var i in this.ruleMap ){
            if( url == i ){
                var handlerCount = this.ruleMap[i].length;
                for( var j=0; j<handlerCount; j++ ){
                    this.ruleMap[i][j].apply( this );
                }
            }
        }
    };

    Router.prototype.initPage = function(){
        console.log('gonna exec initpage func');
        console.log( window.location.pathname );
        var url = window.location.pathname;
        this.matchUrl( url );
    };
    Router.prototype.go = function( url ) {
        console.log('url gonna change to: ' + url);
        window.history.pushState(null, null, url );
        this.matchUrl( url );
    };



    Router.prototype.bind = function( url, handler ){
        if( this.ruleMap[ url ] ){
            this.ruleMap[ url ].push( handler );
        }
        else{
            this.ruleMap[ url ] = [ handler ];
        }
    };

    var router = new Router();
    module.exports = router;
} );


// ------------------ Controller
    // var Router = require('../../common/util/route');
    
    // after require viewers
    //  Router.initPage();

// ------------------ viewer
    // Router.bind('/manage/group/create/biz', function(){
    //     console.log( this );
    //     console.log('i was bind to create page, and i will exec when create page loaded');
    // });

    // Router.bind('/manage/group/biz', function(){
    //     console.log( this );
    //     console.log('only on manage page, exec i will');
    // });

    // bizGroupInfoCancel.bind('click', function(){
    //     Router.go('/manage/group/mamage/biz');
    // });

    // Router.bind( '/manage/group/mamage/biz', function(){
    //     console.log('when it come to mamange page. i will exec');
    // } );

// ------------------ another viewer
    // Router.bind('/manage/group/biz', function(){
    //     console.log( this );
    //     console.log('only on manage page, exec i will');
    // }); 