---
title: '用 NodeJS 开发一版在线流程图网站'
date: '2021/11/10'
lastmod: '2022/03/11'
tags: [JavaScript, Node.js]
draft: false
summary: '对于程序员来说，每天除了写代码，接触较多的可能是各种图表了，诸如流程图、原型图、拓扑图、UML 图以及思维导图等等，我们较为熟悉的是 ProcessOn了'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ea3a9199f34447cb00c1532a54ce8fb~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

**源码**：https://github.com/maqi1520/Clone-processon

## 背景

对于程序员来说，每天除了写代码，接触较多的可能是各种图表了，诸如流程图、原型图、拓扑图、UML 图以及思维导图等等，我们较为熟悉的是 ProcessOn 了，可能你还在用 ProcessOn 免费版， 总共十张图，画完这张图下载下来删除再重新画另一张。前些天，在群里看到有小伙伴在邀请新用户注册，可以获得 3 个文件数。奈何大家都注册了，没注册的只有少数，作为前端程序员，我在想是否可以将它的 js 扒下来，在本地起服务器使用？

## 获取前端静态资源

说干就干，使用 chrome 右键另存为 ，可以直接将这个网站使用到的静态文件保存下来，但是保存下来的静态资源目录都自动替换了本地，但我想要的是跟线上一样的目录结构。

![chrome devtools 查看源码](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4991b21f3e62459f8366dcd8a63dfb66~tplv-k3u1fbpfcp-watermark.image?)
难道右键一个一个 JS 另存为吗？

并不是，可以使用一个 chrome 插件 [Save All Resources ](https://chrome.google.com/webstore/detail/save-all-resources/abpdnfjocnmdomablahdcfnoggeeiedb) 把整个网站的静态资源 down 下来，

安装之后在 chrome devTools 会多出一栏

![chrome 插件 Save All Resources ](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75d7352e265e4eb5915748186bfa5a70~tplv-k3u1fbpfcp-watermark.image?)

点击 `save All Resources` 就可以了，全部 down 下来了.

解压之后，我们一起来看看目录

![下载够解压的文件](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e044968ae3344d48b132fdf9758c450~tplv-k3u1fbpfcp-watermark.image?)

不光这个域名下的静态资源，其他域下的静态资源也都 down 下来了，其实这已经完成一半了。

将全部资源拷贝出来，然后将 html 文件重命名为 `index.html` 使用 [http-server](https://www.npmjs.com/package/http-server) 在当前目录起一个服务，这样就成功访问了。能够画流程图了，只不过数据不能保存。

那么该如何保存数据呢？

## 开发一个 chrome 插件

一开始我的想法是开发一个 chrome 插件，类似[掘金的 chrome 插件](https://chrome.google.com/webstore/detail/%E7%A8%80%E5%9C%9F%E6%8E%98%E9%87%91/lecdifefmmfjnjjinhaennhdlmcaeeeb)一样， 点击就可以打开，然后重写 jquery 的`$.ajax` 的方法，使用 `localStroage` 存储数据，这样可以更加方便我们使用，实现起来应该不难吧。

然后就去找如何开发一个 chrome extension。 我在 github 找到了 [chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) 然后对着里面的 demo，尝试了下。
但结果遂不人愿，因为 ProcessOn 中大量使用了`eval`方法。chrome-extensions 认为这个方法不安全。

又然后根据官网[ Using eval in Chrome extensions](https://developer.chrome.com/docs/extensions/mv3/sandboxingEval/)，根据里面的介绍，将 html 放入一个 `iframe` 中， 这样可以就可以了。略微开心了一下，一起看下我们的 hello Word Chrome extensions。

![流程图在线演示.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a3037d1f319d4814894908c9545eb74c~tplv-k3u1fbpfcp-watermark.image?)

接下来准备保存数据。

iframe 内部想要跟父容器的通信可以使用 parent，又遇到了问题。

![chrome 控制台报错](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8107461ff02d47eaa58fcf12549aa261~tplv-k3u1fbpfcp-watermark.image?)

因为 chrome extension iframe 是直接打开的，并不是在一个 http 服务下，然后我又试了 `postMessage` 等方法，还是不能通信。

既然不能做到纯离线的，那只能开发一个在线版本好了 👌

## Nodejs 开发

### 技术栈

- 后端: [express.js](https://expressjs.com/)
- 数据库: [postgres](http://www.postgres.cn/docs/12/)
- ORM: [prisma](https://prisma.io/)
- Authentication: [github OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- 前端: [Jquery](https://jquery.com/)

这边的技术栈我就直接选用了我[博客](https://maqib.cn/)的相同的技术栈，毕竟注册登录这些代码都能直接拿过来用。

> 感兴趣的同学可以看下我之前的文章 [用 NextJS 和 TailwindCSS 重构我的博客](https://juejin.cn/post/6984267680324780040)

### 表结构

接下来就是根据接口，进行建表

![chrome 控制台查看接口数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/202931e82683455ea9b41af0957e8c00~tplv-k3u1fbpfcp-watermark.image?)

![chrome 控制台查看接口返回的json](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e6310b129524a1b867278f240883d40~tplv-k3u1fbpfcp-watermark.image?)

根据首次加载查看详情的 get 请求 可以看到请求数据，他是将 Json 作为字符串返回的，我估计他使用的是 MongoDB 数据库，id 跟 MongoDB id 长度一致。

```js
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String    @id @default(uuid())
  name           String?
  password       String
  email          String    @unique
  avatar_url     String?
  emailCheckCode String? //邮箱验证唯一code
  checked        Boolean   @default(true) //邮箱是否验证
  posts          Post[]
  historys       History[]
  charts         Chart[]
}

model Comment {
  id      String  @id @default(uuid())
  shapeId String?
  name    String?
  replyId String?
  time    Int
  content String
  userId  String
  chartId String
  chart   Chart   @relation(fields: [chartId], references: [id])
}

model Chart {
  id         String    @id @default(uuid())
  title      String
  deleted    Boolean   @default(false)
  elements   Json
  page       Json
  theme      Json?
  ownerId    String
  owner      User      @relation(fields: [ownerId], references: [id])
  historys   History[]
  comments   Comment[]
  createTime DateTime  @default(now()) @db.Timestamp
  lastModify DateTime  @default(now()) @db.Timestamp
}

model History {
  id         String   @id @default(uuid())
  title      String
  remark     String
  elements   Json
  page       Json
  theme      Json?
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  chartId    String
  chart      Chart    @relation(fields: [chartId], references: [id])
  createTime DateTime @default(now()) @db.Timestamp
}
```

然后是历史表，一对多，一张图对多张历史，每次操作都更新当前数据后，然后插入历史表。

总体来说，实现起来不是很难。

### 部署

想要部署的同学 可以移步 [github](https://github.com/maqi1520/Clone-processon)，里面有写部署步骤。

## TODO

当然还有一些比较困难的还未实现， 比如：

- websocket 多人同步编辑
- 文件上传
- 生成缩略图
- 分享页面

## 总结

- ProcessOn 没有做代码混淆，对于前端来说可以格式化代码后直接修改。
- 前端 js 基础很重要，ProcessOn 没有使用其他框架，就使用了 `jquery` 和 `div` 实现了流程图而且不卡，我之前用 react 也写个类似的拓扑图，但论流畅性和用户体验远不及它。
- 不差钱的同学，还是希望大家支持正版。

**最后**

本篇记录了实现的主要步骤，但是对于一些细节，还有一些特殊代码操作没有记录，希望喜欢的同学点个小赞，加个小星 ✨，后续可以出更多的文章

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/Develop-an-online-flowchart-website-with-NodeJS)
