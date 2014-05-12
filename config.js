
var config = {
    port: 3000,
    dburl: 'mongodb://localhost/blog',
    // dburl: 'mongodb://chenllos.com/blog',
    // 两类请求的基础路径..
    apiBase: '/app',
    pageBase: '',
    // 视图文件路径
    viewPath: './views',

    notAllow: ['']
};

module.exports = config;