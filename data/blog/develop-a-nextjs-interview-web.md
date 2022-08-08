---
title: '【实战】Next.js + 云函数开发一个面试刷题网站'
date: '2022/8/8'
lastmod: '2022/8/8'
tags: [Next.js]
draft: false
summary: '前段时间开发了一个面试刷题小程序——面试狗，主要使用了 uniapp + unicloud 云开发实现，今天我们来开发一个与之对应的 PC 版面试刷题网站。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84b4dbe2bb3c4c9a80df45abf9975a04~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

前段时间开发了一个面试刷题小程序——面试狗，主要使用了 uniapp + unicloud 云开发实现，详情可以看这篇文章[《【实战】使用 uniapp 开发一个面试刷题小程序》](https://juejin.cn/post/7102282659102982152) ，今天我们来开发一个与之对应的 PC 版面试刷题网站。

体验地址：https://www.runjs.cool/interview

## 技术栈选择

- Next.js —— React 服务端渲染框架
- Tailwindcss —— CSS 原子类框架
- 云数据库 —— 和小程序公用一套数据库

## 项目初始化

首先我们使用 `create-next-app` 创建一个新的 next 项目

```bash
npx create-next-app next-interview
cd next-interview
```

进入到 `next-interview` 目录下安装 `tailwindcss` 相关 npm 包，并且初始化 `tailwindcss` 配置文件

```bash
yarn add --dev tailwindcss postcss autoprefixer @tailwindcss/typography
npx tailwindcss init -p
```

接下来将 `pages` 和 `styles` 文件夹重新移动到 `src` 目录下，这一步是我个人习惯。

修改 `tailwindcss.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
```

这样 tailwindcss 只会编译 `src` 目录下使用到的 `css` 类，其中是 `@tailwindcss/typography` 是 tailwind 官方提供的文章插件，小程序中题目和答案使用 markdown 编辑的，所以使用到这个插件可以方便样式设置。

然后修改 `styles/globals.css` 中 css 为 tailwindcss 的指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

修改 `index.js` 中的代码，测试下 tailwindcss 是否配置成功

```js
import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>前端面试题库</title>
      </Head>
      <h1 className="flex justify-center p-10 text-3xl text-blue-500">前端面试题库</h1>
    </div>
  )
}
```

修改后，运行 `yarn && yarn dev`，可以在浏览器中看法如下效果
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a3d715021e244f1a88562ceb2ca9ba7d~tplv-k3u1fbpfcp-zoom-1.image)

至此项目初始化成功。

## 云数据库

之前我们在小程序中设计好了云数据，并且可以在小程序中请求数据，下面这个接口对应数据库中的题目表

```ts
export interface Question {
  _id: string
  category: string // 分类
  title: string //标题
  desc: string // 简介
  options?: string //选项，选择题
  explanation: string // 答案解析
  level: number // 难度等级
  tagId: number // 标签
}
```

我们原来的的云函数代码如下，用于请求题目列表

```js
exports.main = async (event, context) => {
  const db = uniCloud.database()
  const page = event.page || 1
  const res = await db
    .collection('fe-question')
    .skip((page - 1) * 20)
    .limit(20)
    .get()
  //返回数据给客户端
  return res.data
}
```

在 uniapp 中可以使用 `uniCloud.callFunction` 方法直接请求数据，那么在 Next.js 项目中要如何请求数据呢？

## 云函数 URL 化

### 设置云函数 HTTP 访问地址

- 登录 uniCloud 后台 (opens new window)，选择服务空间。
- 单击左侧菜单栏【云函数】，进入云函数页面。
- 点击需要配置的云函数的【详情】按钮，配置访问路径。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5326559b6ba940b5a6b6a6a8bdc1d1ad~tplv-k3u1fbpfcp-zoom-1.image)

注意：`path` 应该以 `/` 开头，例如：`/functionName`

### 云函数的调用方式

在云函数中，不同的调用方式在`context.SOURCE` 中可以获得不同的参数

- client： 客户端`callFunction`方式调用
- http： 云函数 url 化方式调用
- timing： 定时触发器调用
- server： 由管理端调用，`HBuilderX`里上传并运行
- function： 由其他云函数 `callFunction`调用

```js
'use strict'
exports.main = async (event, context) => {
  let source = context.SOURCE // 当前云函数 Url 后, 为 http 的方式调用
}
```

### 云函数的入参

使用 HTTP 访问云函数时，HTTP 请求会被转化为特殊的结构体，称之为集成请求，结构如下：

```js
{
    path: 'HTTP请求路径，如 /hello',
    httpMethod: 'HTTP请求方法，如 GET',
    headers: {HTTP请求头},
    queryStringParameters: {HTTP请求的Query，键值对形式},
    body: 'HTTP请求体',
    isBase64Encoded: 'true or false，表示body是否为Base64编码'
}
```

使用`GET`请求`https://${云函数Url化域名}/${functionPath}?a=1&b=2`，云函数接收到的`event`为

```js
{
    path: '/',
    httpMethod: 'GET',
    headers: {HTTP请求头},
    queryStringParameters: {a: "1", b: "2"},
    isBase64Encoded: false
}
```

使用`POST` 请求`https://${spaceId}.service.tcloudbase.com/${functionPath}`，云函数接收到的 `event.body` 为请求发送的数据

```js
{
    path: '/',
    httpMethod: 'POST',
    headers: {
    	...
    	"content-type": 'application/json'
    },
    isBase64Encoded: false,
    body: '{"a":1,"b":2}', // 注意此处可能是base64，需要根据isBase64Encoded判断
}
```

所以我想要一个云函数，在小程序和 web 端同时调用，可以在外层加一个判断，这里以 post 为例，以下是获取题目列表的接口代码

```js
exports.main = async (event, context) => {
  const db = uniCloud.database()

  let source = context.SOURCE
  let data = event
  if ('http' === source) {
    // data=event.queryStringParameters  //get 方式获取参数
    data = JSON.parse(event.body) // post 方式获取参数
  }

  const page = data.page || 1
  const res = await db
    .collection('fe-question')
    .skip((page - 1) * 20)
    .limit(20)
    .get()
  //返回数据给客户端
  return res.data
}
```

将以上代码重新部署，就可以通过 http 的方式访问了。

## 服务端渲染

为了能够让搜索引擎收录内容，我们选择服务端渲染，在 Next.js 中，可以再导出一个函数`getServerSideProps` ，这个函数名称是 Next.js 固定的，不可以写错哦。

```js
import fetch from 'node-fetch'

function Page({ data }) {
  // 渲染数据
  return data.map((item) => <div key={item.id}>...</div>)
}

// 每次页面刷新都会执行这个方法
export async function getServerSideProps() {
  // 从云函数请求数据
  const res = await fetch(`https://.../data`)
  const data = await res.json()

  // 将返回的结果通过 props 传递给组件
  return { props: { data } }
}

export default Page
```

注意：`getServerSideProps`函数是在 Nodejs 环境下执行的，若部署的 node 版本低于 17，则需要先安装`node-fetch`

到此，你已经了解了整个开发流程，接下来就数据渲染，跟 react 开发没有异同了，关于 Next.js 的更多用法可以参考 Next 官方文档，也可以参考 [React 必学 SSR 框架——Next.js](https://juejin.cn/post/6877058515538542605) 这篇文章。

## 部署

Vercel 是一个开箱即用的网站托管平台，Next.js 是 vercel 公司的明星项目， 只需要将代码上传 GitHub，登录 [vercel.com](https://vercel.com/) ，并且使用 GitHub 登录即可, 点导入，几分钟后便可部署成功！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2edd04aa028f4c92a0759863f107a335~tplv-k3u1fbpfcp-zoom-1.image)

### 存在问题

当我在部署成功后，发现部署成功后发现接口很慢，每次请求需要 2s 以上

![没优化之前的速度](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b85391055294044970f2a8335128d83~tplv-k3u1fbpfcp-watermark.image?)

但是我本地开发的时候却很快，基本都在 200ms 以内，这是什么原因呢？

![本地请求速度](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36af1dedce2a4a74a53ca9f87aa95358~tplv-k3u1fbpfcp-zoom-1.image)

其实 vercel 部署的时候会把 `getServerSideProps` 中方法部署为 serverless 云函数。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e43f4bccba3e4352980f359fd4461721~tplv-k3u1fbpfcp-zoom-1.image)

而默认是部署区域在美国华盛顿特区，而 uniCloud 的云函数则是部署在上海的，也就我一个请求在发出，在上海和美国盛顿特来了个往返。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ab92c577726481091dcad067df5d54a~tplv-k3u1fbpfcp-zoom-1.image)

当然我们可以在 Vercel 中设置 serverless 的 Region 为香港，这样稍微可以快点。

## 小结

本文通过一个实现一个面试刷题网站，讲述了 Next.js 和云开发部署的全过程，至此，你也成为了一名全栈工程师。

### 优点

- Vercel 完美的结合和 GitHub，部署极快
- Vercel 可以自动分配 Https 证书，我们可以添加自定义绑定域名，并且域名可以免备案
- 云开发选择阿里云，云数据库和云函数都免费

### 缺点

Next.js ssr 渲染方式需要在 2 个 Region 之间的请求数据，相对来说请求速度较慢。

## 最后

最后为了权衡访问速度和 SEO，最终我放弃使用 ssr 的渲染方式，直接使用客户端渲染，别忘了 Next.js 不但支持 SSR， 还支持 CSR。
我的这个网站也开源了，包含一些前端常用工具，还可以在线刷面试题。

- [前端工具箱](https://www.runjs.cool/ '前端工具箱')
- [GitHub 代码](https://github.com/maqi1520/runjs.cool '前端工具箱源码')

如果对你有帮助，可以随手点个赞，这对我真的很重要。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
