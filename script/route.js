define(function( require, exports, module ){
    // var readReg = /^\/read/;
    // if( readReg.test( location.pathname ) ){
    //     document.body.className = 'readmode';
    // }

    // if( location.pathname !== '/' &&  location.pathname.indexOf('read') < 0){
    //     alert('going to 404 page...');
    // }

    // function pushUrl( stateObj, title, pathname ){
    //     window.history.pushState( stateObj, title, $(this).attr('href'));
    //     this.routes();
    // }

    var Router = function( route ){
        this.route = route;
        return this;
    };
    Router.prototype.go = function( stateObj, title, pathname ) {
        window.history.pushState( stateObj, title, pathname );
        this.route( pathname );
    };

    module.exports = Router;
    // 相当于在页面内部配置了一套路由系统, 根据pathname和search进行页面内的路由:
    //      显示怎样的布局
    //      发送什么请求
    //      传递何种参数


    // 那么根据后台的nodejs的路由设置经验,应该是这样的:
    //      route.js位于app.js的最接近的一层
    //      它会require所有写好的方法
    //      然后根据url( request的pathname )来调用这些方法
    //      然后应该有严格的匹配(逻辑要严谨) 和 权重(不好实现...), 如我们设定 /read进入阅读模式, /art/:id加载某篇blog
    //             那么就应该在进入阅读模式后才可以有art  即严格的url模式是这样的: /read/art/:id
    //              不符合的可以直接到404哦... 也许可行, 嗯,url载入时就执行路由?可行吗?
    //                  或则干脆nginx路由上不配,直接404了...
    // 哈哈,我真是天才~



    // 函数调用push(封装好的push, 里面包含监听器,监听url的pathname)
    // 所以应该是: app require route 和  funcs  然后绑定...
});