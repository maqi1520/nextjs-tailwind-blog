---
title: '如何白嫖一个动态网站'
date: '2021/11/27'
lastmod: '2022/03/21'
tags: [前端, 后端]
draft: false
summary: '我们知道，想要搭建一个网站往往需要一下几个步骤： 域名注册 服务器购买、 数据库购买或部署、网站设计、 网站开发、网站备案 网站上线、本文将介绍如何用最小的成本和最短时间开发部署一个动态网站。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3631817d12ad45ebbf545cf2f2fb9b5e~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

我们知道，想要搭建一个网站往往需要一下几个步骤：

1. 域名注册
2. 服务器购买
3. 数据库购买或部署
4. 网站设计
5. 网站开发
6. 网站备案
7. 网站上线

在国内上线一个网站，域名还必须得备案，光是域名备案的话还的几个星期，整个流程下来，上线一个网站可能要个把月。若选择云服务器，各大云平台新用户首年还有优惠，次年想要续费得花上不小成本。本文将介绍如何用最小的成本和最短时间开发部署一个动态网站。

## 购买域名

免费的域名可以选择[Freenom](https://www.freenom.com/zh/index.html?lang=zh)，当然也可以选择不用域名，如果选择 Vercel 部署会自动分配一个二级域名，也挺好用的。当然域名注册也很便宜，最低 1 元，我这边选择的是[腾讯云](https://cloud.tencent.com/act/double11?spread_hash_key=4ddf7c7810bc0cdc1b7f9c55ab432da1&cps_key=70b0df2059c36f5f53646bd8c2452f81)，购买之后只需要实名认证（上传身份证等信息）就可以直接域名解析了。

## 网站设计

对于程序员来说，网站设计可能会困扰到大家，大家可以去[dribbble](https://dribbble.com/search/blog)，[站酷](https://www.zcool.com.cn/discover?cate=607&subCate=618)等网站搜索向要实现的 app，挑选一个好看的设计应用到自己的网站中。

![dribbble 页面截图](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dacf796f96c247e0817de644174ce05f~tplv-k3u1fbpfcp-watermark.image?)

如果你会 TailwindCSS 我推荐 VSCODE 安装 这个插件[tailwind-snippets](https://marketplace.visualstudio.com/items?itemName=Zarifprogrammer.tailwind-snippets) 可以快速帮我们来发出一个常用的代码片段，大家可以在 https://www.tailwindsnippets.ml/snippets 查看效果，快速实现我们的 html 页面

![tailwind-snippets 预览](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05c93422411f4becb33077b652739c82~tplv-k3u1fbpfcp-watermark.image?)

## 部署

### [Vercel](https://vercel.com/)

Next.js 开发商 Vercel 获得最近 1.5 亿美元 D 轮融资。Vercel 注册什么的我就不讲了，建议使用**GitHub** 登录, 点击**new project**创建一个项目，这个项目可以从自己的 GitHub 库导入或者选择 Vercel 给的模板，Vercel 给的模板（下图）首先也会导入进自己的 GitHub 库，总之要先把内容导入进 GitHub 库才行。

![Vercel 支持的框架](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d9e7480c89a4cc790189fd5d678b3ae~tplv-k3u1fbpfcp-watermark.image?)

Vercel 为个人用户提供了

1. 自动 HTTPS/SSL
2. 带宽 100 GB
3. 并发构建，每天 10 万次调用
4. Serverless Function

所以 Vercel 不光支持静态网站也支持 nodejs 动态网站，如果想要其他后端语言

可以选择 [heroku](https://www.heroku.com/)

### [heroku](https://www.heroku.com/)

Heroku 是一个支持多种编程语言的云平台，并且提供了 [Heroku Postgres](https://www.heroku.com/postgres)、[Heroku Redis](https://www.heroku.com/redis)、[Apache Kafka on Heroku](https://www.heroku.com/kafka)、

![Heroku 支持的语言](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f602fdd8be142cabce77917b89dcbbd~tplv-k3u1fbpfcp-watermark.image?)

Heroku 虽然提供了比较全面的编程语言和数据库支持，免费用户还支持

1. 使用 Git 和 Docker 部署
1. 自定义二级域名
1. 容器编排
1. 自动操作系统补丁

但 heroku 对国内用户支持不是很友好，第一点访问国内速度比不上 Vercel， 第二点 163 和 QQ 邮箱都不能注册，想要注册得要其他邮箱， 第三没有免费的 ssl。第四项目源代码只能有 500M。

## 数据库选择

### MongoDB

选择 https://cloud.mongodb.com/

![mongodb 首页截图](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/031963f343fb4dfd9096b7be79862dfe~tplv-k3u1fbpfcp-watermark.image?)

创建 database 的时候选择 free；

![选择免费截图](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4acedb2cc1042788c6b32dd022a522c~tplv-k3u1fbpfcp-watermark.image?)
地域可以选择日本或者新加坡。

接着创建一个用户
![创建一个用户](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e08fcee9fb274db5b6faf5d1ea979915~tplv-k3u1fbpfcp-watermark.image?)
密码是自动生成的，要把密码拷贝下来

接着要创建一个允许链接的 IP 地址

![在 mongodb.com 设置允许链接的IP](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f96074a0042456bb79c244a1153e6f7~tplv-k3u1fbpfcp-watermark.image?)

这里选择任何地方可以链接

接下来选择 database 点击 connect

![在 mongodb.com 选择开发语言](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d3e21ff987e4b739c13bcaea7864dc0~tplv-k3u1fbpfcp-watermark.image?)

还可以选择开发语言
![在 mongodb.com 查看密码](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/470cf2d7f8344a629ebf0da3498dfbd0~tplv-k3u1fbpfcp-watermark.image?)

上面的`password` 要替换成刚才创建用户的随机生成的密码

### mysql

mysql 可以选择https://planetscale.com/

![在 planetscale.com 选择免费模式](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f77c432c5486433c92bba74a32c54ae8~tplv-k3u1fbpfcp-watermark.image?)

针对免费用户可以：

1. 每月 10GB 存储
2. 每月 1 亿行读取
3. 每月 1 千万次写
4. 每个数据库 3 个分支
5. 1,000 个链接
6. 每日自动备份
7. 社区支持

可以直接接使用 Github 登录，跟着引导直接到最后一步创建数据库，

![在 planetscale.com 选择地域](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/288c98e892ac43cb888e80b7020e4da1~tplv-k3u1fbpfcp-watermark.image?)

地域选择就近新加坡或者日本。

![在命令行选择 planetscale.com](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/08cec11a167d4ccf83a83e967fe8d141~tplv-k3u1fbpfcp-watermark.image?)

可以在命令行中管理数据，点击上图中的按钮随机生成密码，密码要用户手动保存，后面登录将无法看到

## 域名解析

Vercel 绑定域名

![腾讯云解析域名到 Vercel](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9f8a5543b8d4f5fa8dfa708c483588f~tplv-k3u1fbpfcp-watermark.image?)

绑定域名我就不多讲了吧，直接去自己的域名平台，cname 域名到 cname.vercel-dns.com，然后 Vercel 会自动帮你生成一个证书。

## 网站备案

这边介绍的方案都是服务都不是部署在大陆的，所以可以选择不用备案，但如果想要在大陆运营的话，海外的速度往往跟不上的，还是要选择大陆的服务器，备案必不可少，各大云服务厂商都提供了备案服务，按照要求填写网站信息即可。

如果你之前没买过[【云服务器】](https://cloud.tencent.com/act/cps/redirect?redirect=1575&cps_key=70b0df2059c36f5f53646bd8c2452f81&from=console) 可以买一个 3 年 2 核 4G 的轻量应用服务器。

![3 年 2 核 4G 的轻量应用服务器](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95b034115d314717a07263b3049e9f8f~tplv-k3u1fbpfcp-watermark.image?)

如果是老用户切换成 QQ 登录也可以买。毕竟服务器在国内，白国外还是好快很多的。

我之前给我的[博客](https://maqib.cn/)备案的时候是 16 年，现在也不记得具体步骤。
只记得备案方会给你邮寄一个幕布，按要拍了照片邮寄回去即可。不是很复杂，就是时间久了点。
![网站备案幕布拍照](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c265ef8fbe44d53ac779518406b31d7~tplv-k3u1fbpfcp-watermark.image?)

## 最后

接下来就是网站运营了，需要给网站引流，带来更多精准用户，网站的价值才能发挥最大。推广主要渠道和方式有 SEO、SEM、新媒体、信息流广告等。至于怎么做网站推广又是另外一个大话题了。

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/how-to-deploy-a-dynamic-website-for-free)
