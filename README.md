## chenllos的blog程序
### 开发
```
// 安装依赖
npm install
// 执行构建
gulp dev
// 或gulp watch辅助开发, wd for watch dev
gulp wd
// 运行程序
node app.js
```
构建和运行的顺序很重要, `gulp dev`或`gulp wd`会构建开发环境: 更换version.js为开发版, 这会使

* seajs.use引入的是开发的高粒度模块, 而不是构建好的单文件, 方便实时修改
* less编译不进行压缩
* 影响顺序的是: 由于使用jade预编译, 即将jade文件编译为js function, 响应请求时只是将数据传入js function生成html字符串, 然后send出去. 开发中jade实时修改实时生效的黑魔法在/back/pageController/render.js中: 读取version.js, 判断是否通过nodejs的fs.watch进行监控, 如果version标明是dev环境, 则监控, 监控后实时刷新jade预编译的js function. 同时gulp中有watchjade变更, setTimeout然后试试刷新浏览器.


### 部署
```
npm install
gulp
pm2 start app.js
// or
forever start app.js
