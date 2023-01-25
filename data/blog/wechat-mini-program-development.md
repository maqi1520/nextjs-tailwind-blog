---
title: 小程序开发入门及多端开发浅析
date: 2020/11/30 17:26:40
lastmod: 2023/1/25 21:43:32
tags: [微信小程序, JavaScript]
draft: false
summary: 本部通过一个demo 入门介绍微信小程序云开发，并引申出跨端开发的现状，简要介绍各跨端开发框架，并简述其跨端开发原理。
images: []
authors: ['default']
layout: PostLayout
---

## 前言

现在小程序虽然不是最火的时间段，但是小程序“触手可及，用完即走”的理念对于未知开发者保持一定的神秘和吸引力，应后端同学对小程序开发的热情，笔者在疫情期间也开发上线了一个款小程序[面试狗](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e79ba7971fc4bfbb539676438a66ef4~tplv-k3u1fbpfcp-watermark.image?)，虽然只是功能非常简单，但凭着一点学习经验给大家带来分享。

## 小程序是什么

![小程序介绍](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ff1ee9fe5fe4e819ac7963ec65354b5~tplv-k3u1fbpfcp-zoom-1.image)

- 类 web，但又不是 HTML5
- 基于微信 跨平台
- 媲美原生操作体验（语音，摄像头，地理定位...）
- 连接微信生态（用户信息，社交化，微信支付...）

大家可以扫描上方二维码（也可以搜索“小程序示例”）体验下微信小程序的功能。

## 开发准备

要求开发者有一些前端知识（HTML，CSS ，JavaScript），
“工欲善其事必先利其器”，我们得先:

- [下载微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html),
- [注册一个 AppID](https://mp.weixin.qq.com/)
  虽然开发的时候可以使用测试号，但为了开发上线，注册 APPID 也是必须的。

## Todo-app demo

一个前端框架的学习，都是从 todo-app 开始的，小程序也一样

### 创建项目

![微信开发者工具](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f9c55a916e94458a749cb950e3b6ddf~tplv-k3u1fbpfcp-zoom-1.image)

下载完成后，点击选择小程序，初次使用，先不使用云服务，点击完成，就会帮我们初始化一个简单小程序项目。

### 目录结构

```bash
|- app.json
|- app.js
|- pages
   |- home
      |- home.wxml
      |- home.js
```

我们看到小程序的初始化代码中，主要包含 JSON、JS、WXMl、WXCSS，其中 WXMl 对应 web 中的 HTMl，WXCSS 对应 web 中的 CSS。

### 全局配置文件

```json
{
  "pages": ["pages/index/index", "pages/logs/index"],
  "window": {
    "navigationBarTitleText": "Demo"
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/logs/index",
        "text": "日志"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": true,
  "navigateToMiniProgramAppIdList": ["wxe5f52902cf4de896"]
}
```

小程序根目录下的 app.json 文件是用来对微信小程序进行全局配置，决定页面文件的路径、窗口表现、设置网络超时时间、设置多 tab 等。

### 页面配置

```json
{
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black",
  "navigationBarTitleText": "Todo",
  "backgroundColor": "#eeeeee",
  "backgroundTextStyle": "light"
}
```

每一个小程序页面也可以使用同名 .json 文件来对本页面的窗口表现进行配置，页面中配置项会覆盖 app.json 的 window 中相同的配置项。

```js
wx.setNavigationBarTitle({
  title: '当前页面',
})
```

当然对于动态的页面，我们也可以使用 wx 提供的接口修改标题

### WXML 视图文件

![WXML 视图文件 对比 html](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/129f9b38d8984f7a80f7aa63f9a32da8~tplv-k3u1fbpfcp-zoom-1.image)

视图 WXML 文件类似 HTML 文件，用来构建出小程序的页面结构，不同于 HTML 的是:

1. 没有了 div、p 等块级元素的标签，替换为与之对于的 view，scroll-view 标签

2. 没有了 span em a 等行内元素标签，替换为与之对应的 text、navicator 标签

3. 提供了丰富的组件标签 modal、picker、swiper 等，等同于引入了一个组件库。

### WXSS 样式文件

![WXSS 样式文件列表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf48d5d6d17b46b3a0951dbc4abc4612~tplv-k3u1fbpfcp-zoom-1.image)

WXSS 样式文件等同于 CSS 文件，但是也是有一些区别的：

1. 选择器类型变少了，仅支持上图的选择器，没有了相邻选择器和属性选择器，伪类选择器也变少了，没了有`:last-child`等

2. 新增了一个单位 rpx。rpx 是以设计稿 750px 自适应的一个单位，也就是在 750px 设计稿上，量出多少 px，那么你就定义多少 rpx，在不同的设备上，小程序能够自适应。

### 生命周期

**页面生命周期**

```js
Page({
  data: {
    text: 'This is page data.',
  },
  onLoad: function (options) {
    // 页面创建时执行
  },
  onShow: function () {
    // 页面出现在前台时执行
  },
  onReady: function () {
    // 页面首次渲染完毕时执行
  },
  onHide: function () {
    // 页面从前台变为后台时执行
  },
  onUnload: function () {
    // 页面销毁时执行
  },
  onPullDownRefresh: function () {
    // 触发下拉刷新时执行
  },
  onReachBottom: function () {
    // 页面触底时执行
  },
  onShareAppMessage: function () {
    // 页面被用户分享时执行
  },
  onPageScroll: function () {
    // 页面滚动时执行
  },
  onResize: function () {
    // 页面尺寸变化时执行
  },
  onTabItemTap(item) {
    // tab 点击时执行
    console.log(item.index)
    console.log(item.pagePath)
    console.log(item.text)
  },
  // 事件响应函数
  viewTap: function () {
    this.setData(
      {
        text: 'Set some data for updating view.',
      },
      function () {
        // this is setData callback
      }
    )
  },
  // 自由数据
  customData: {
    hi: 'MINA',
  },
})
```

**组件生命周期**

```js
Component({

  behaviors: [],

  properties: {
    myProperty: { // 属性名
      type: String,
      value: ''
    },
    myProperty2: String // 简化的定义方式
  },

  data: {}, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () { }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() { },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { },
    hide: function () { },
    resize: function () { },
  },

  methods: {}
}
```

同 react 和 vue 一样小程序框架也有自己的生命周期函数，但是小程序的页面生命周期和组件生命周期是不同的
我们不必去记上面的生命周期函数，使用开发者工具新建页面的时候，工具会帮我们自动建立一个最简单的页面。
当鼠标移动到生命周期函数时，工具会给我们提示函数的作用。

![微信开发者工具提示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14896eeb15b0442b9a37a604197dcc2e~tplv-k3u1fbpfcp-zoom-1.image)

### 事件绑定

```html
<view id="tapTest" data-hi="Weixin" bindtap="tapName"> Click me! </view>
```

```js
Page({
  tapName: function (event) {
    console.log(event)
  },
})
```

```json
{
  "type": "tap",
  "timeStamp": 895,
  "target": {
    "id": "tapTest",
    "dataset": {
      "hi": "Weixin"
    }
  },
  "currentTarget": {
    "id": "tapTest",
    "dataset": {
      "hi": "Weixin"
    }
  },
  "detail": {
    "x": 53,
    "y": 14
  }
}
```

绑定事件可以通过 bind 开头的指令，就可以绑定页面上的方法，除 bind 外，也可以用 catch 来绑定事件。与 bind 不同， catch 会阻止事件向上冒泡，其他的事件分类可以查看[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html#%E4%BA%8B%E4%BB%B6%E5%88%86%E7%B1%BB)

### 小程序登录

使用小程序开发的一个最大优势就是，可以借助微信的用户系统。我们不必单独在做注册登录这些功能，通过小程序对所有用户都有一个 openid，来建立自己的用户系统，如果你小程序是认证的，就可以通过`getPhoneNumber` 获取微信用户绑定的手机号。

![小程序登录流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a9968fc53304b1fb2cc660137ea2ee5~tplv-k3u1fbpfcp-zoom-1.image)

小程序代码，登录后发送 res.code 到后台换取 openId, sessionKey, unionId

```js
onLaunch: function () {
   //...
   wx.login({
      success: res => {
         wx.request({
            url: 'https://next-5g925nky83ece5ae.service.tcloudbase.com/koa-starter/login',
            method: 'POST',
            data: {
               "JSCODE": res.code
            },
            success: (res) => {
               const openid=res.data.openid
               this.globalData.openid=openid
            }
         })
      }
   })
   //...
}
```

后端 nodejs 代码，根据 code 获取 openid

```js
router.post('/login', async (ctx, next) => {
  const { JSCODE } = ctx.request.body
  const res = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: AppID,
      secret: AppSecret,
      js_code: JSCODE,
      grant_type: 'authorization_code',
    },
  })

  ctx.body = res.data
})
```

把 openid 存储到 globalData，方便后面调用

### 编写 todo 代码

具体代码，大家可以看[代码仓库](https://github.com/maqi1520/learn-wechat 'demo 代码仓库')，很简单，每次操作后通过接口请求，把数据同步到云端。遍历 todos 的时候，可以把 todo-item 封装成一个自定义组件，需要注意的是：

- 因为 WXML 节点标签名只能是小写字母、中划线和下划线的组合，所以自定义组件的标签名也只能包含这些字符。
- 自定义组件也是可以引用自定义组件的，引用方法类似于页面引用自定义组件的方式（使用 usingComponents 字段）。
- 自定义组件和页面所在项目根目录名不能以“wx-”为前缀，否则会报错。

- 在组件 wxss 中不应使用 ID 选择器、属性选择器和标签名选择器。

## 云开发

看到上面请求的 url 接口了吧，从域名看，我使用了[腾讯云 cloudbase](https://cloud.tencent.com/document/product/876)，cloudbase 为开发者提供高可用、自动弹性扩缩的后端云服务，包含计算、存储、托管等 serverless 化能力。

其实刚刚创建项目的时候，我们可以选择云开发，微信小程序会帮我们自动创建一个腾讯云 CloudBase 的账号，也可以使用云函数、云数据库相关等功能，但是微信开发者功能提供的云开发功能只支持微信，~~web 端不支持~~（现在好像支持了），我这边就直接使用腾讯云了，方便管理

### nodejs 云函数空白模板

![新建云函数](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/132fd8ed91974ded9346bb759f74052c~tplv-k3u1fbpfcp-zoom-1.image)

下面我们创建一个云函数, cloudbase 帮我们生成了下面代码

```js
'use strict'
exports.main = async (event, context) => {
  console.log('Hello World')
  console.log(event)
  console.log(event['non-exist'])
  console.log(context)
  return event
}
```

将云函数关联 HTTP 访问服务
![云函数关联 HTTP 访问服务](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b8c2b45602a94d83abe89b05d0570eb9~tplv-k3u1fbpfcp-zoom-1.image)

然后访问这个[Http 服务](https://next-5g925nky83ece5ae-1256585691.ap-shanghai.app.tcloudbase.com/login)
我们就可以看到 HTTP 请求 header 等信息，结合云数据库，我们就可以写出 todos 相关的增删查改的接口了

### 云开发 CloudBase Framework

我们习惯了使用 express、koa 等 nodjs 框架开发接口，如果要将所有接口一个一个分开写，肯定有些不习惯，不用担心，腾讯云[cloudbase-framework](https://github.com/Tencent/cloudbase-framework)提供了传统框架向云开发迁移和部署的能力，相信熟悉大家只需要按官方项目实例，开发部署即可。

![云开发 CloudBase Framework 流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e31621f7aa0c497b8db048af619fb55e~tplv-k3u1fbpfcp-zoom-1.image)

## 多端开发

- 微信小程序开发完成了——“累”

- 我还想支持其他平台怎么办?——“学不动了”。

（H5、原生 APP、支付宝、钉钉、百度...）

### 多端开发框架

- taro，京东凹凸实验室出品，[官网地址](http://taro.jd.com/ 'taro 官网'),使用 react 和 vue 开发，跨端都支持
- uni-app，DCloud 团队出品，[官网地址](http://niapp.dcloud.net.cn 'uni-app 官网')，使用 vue 开发，跨端都支持
- kbone，腾讯微信团队出品，[官网地址](http://wechat-miniprogram.github.io/kbone/docs/ 'kbone 官网')
  使用 react 和 vue 开发，但是只支持 web 和微信小程序
- remax，阿里团队出品，[官网地址](https://remaxjs.org/ 'remax 官网')使用 react 开发，跨端都支持

我们可以看下昨天的测评文章，跟着 demo 学习下跨端的实现。
[uni-app 作者测评地址](https://github.com/dcloudio/test-framework 'uni-app 作者测评地址')
[taro 作者测评地址](https://developers.weixin.qq.com/community/develop/article/doc/000eaadb944de06374485c3ed51813 'taro 作者测评地址')

### taro2 实现原理

![babel 编译原理](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/320b4fa6dcbf4167afbd7febded0d74c~tplv-k3u1fbpfcp-zoom-1.image)

有过 Babel 插件开发经验的应该对一下流程十分熟悉，Taro 的编译时也是遵循了此流程，使用 [babel-parser](https://babeljs.io/docs/en/babel-parser 'babel-parser') 将 Taro 代码解析成抽象语法树，然后通过 [babel-types](https://babeljs.io/docs/en/babel-types 'babel-types') 对抽象语法树进行一系列修改、转换操作，最后再通过 [babel-generate](https://babeljs.io/docs/en/babel-generator 'babel-generator') 生成对应的目标代码。

**taro2 特点**

- 重编译时，轻运行时：这从两边代码行数的对比就可见一斑
- 编译后代码与 React 无关：Taro 只是在开发时遵循了 React 的语法。
- 直接使用 Babel 进行编译：这也导致当前 Taro 在工程化和插件方面的羸弱。

### Remax 实现原理

用 react 写 Web 、可以写小程序 、可以写原生应用

![react 多端开发](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/699ecc1f39d24ad189dea3e061ef9dac~tplv-k3u1fbpfcp-zoom-1.image)

Remax 的运行时本质是一个通过 react-reconciler 实现的一个小程序端的渲染器

![Remax 编译原理](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c202f4e6f4441728bb48598bb43d37b~tplv-k3u1fbpfcp-zoom-1.image)

### 扩展阅读

- [《史上最贴心 React 渲染器开发辅导》](https://cloud.tencent.com/developer/article/1664392 '史上最贴心 React 渲染器开发辅导')
- [《小程序跨框架开发的探索与实践》](https://aotu.io/notes/2020/01/02/gmtc/index.html '小程序跨框架开发的探索与实践')
- [《Remax 实现原理》](https://remaxjs.org/guide/implementation-notes 'Remax 实现原理')

## 总结和思考

- 距离真正的生产环境还有很长的路要走

我们着手使用云开发开发了一个 Todo app 微信小程序，但这仅仅是一个 hello world，小程序还有支付、关联公账号等功能，只有开发了这些功能，才能体现小程序的优势。

- 跨端开发并不难

我们了解了跨端开发框架，并熟悉其实现原理，从开发者的角度看，我们需要开发微信支付宝等多个小程序；然而站在浏览器的角度看，它们的差别其实没那么大，都是调用了 BOM/DOM 那几个常用的 API。站在在 React 的角度，我们仅需要实现一个渲染层，更何况现在我们可以使用现成的框架开发。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
