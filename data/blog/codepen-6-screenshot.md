---
title: '实现一个 Code Pen：（六）云函数生成网页缩略图'
date: '2022/5/13'
lastmod: '2022/5/13'
tags: [JavaScript, React.js]
draft: false
summary: '本文介绍了生成缩略图的方式，包含客户端生成，和服务端生成，并简要分析了阿里云、腾讯云和 vercel 生成浏览器截图的方式。'
images: []
authors: ['default']
layout: PostLayout
---

## 前言

在前面的文章中，我们已经实现了编辑器的功能，并且数据可以保存到云数据库，接下来我们需要生成缩略图的功能，目前掘金的的 code pen 还没有缩略图的功能，这是否是一个挑战呢？

## 缩略图生成方法

生成缩略图的方法可分为 2 种，一种是客户端生成，还有一种是服务端生成。

## dom-to-img

客户端生成我第一个想到的是使用到一个库 `dom-to-img`

这个库，其主要原理是：

- 将 html node 转化为 xml，设定命名空间
- 用 `foreignObject` 包裹 xml
- 把内容变为了 svg
- svg 变为 base64 的图片

  下面代码是最核心的源码中的一个函数 `makeSvgDataUri`

```js
function makeSvgDataUri(node, width, height) {
  return Promise.resolve(node)
    .then(function (node) {
      node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
      return new XMLSerializer().serializeToString(node)
    })
    .then(util.escapeXhtml)
    .then(function (xhtml) {
      return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>'
    })
    .then(function (foreignObject) {
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        width +
        '" height="' +
        height +
        '">' +
        foreignObject +
        '</svg>'
      )
    })
    .then(function (svg) {
      return 'data:image/svg+xml;charset=utf-8,' + svg
    })
}
```

使用这个库的好处是可以通过客户端生成，节省服务端资源。但不足的是用户的浏览器大小不一，所生成的图片大小也不一样， 所以在我们 code pen 缩略图场景中，客户端生成不合适。

## Puppeteer

服务端生成缩略图，我想到的是使用 Puppeteer 生成网页截图，来到达生成缩略图的效果。

Puppeteer 可以将 Chrome 或者 Chromium 以无界面的方式运行（当然也可以运行在有界面的服务器上），然后可以通过代码控制浏览器的行为，即使是非界面的模式运行，Chrome 或 Chromium 也可以在内存中正确渲染网页的内容。

### vercel

由于我使用的是 vercel 部署的，那么我们是否可以使用 vercel 来生成缩略图吗？

我在一顿搜索之后找一篇文章 [《Generate Open Graph images on-demand with Next.js on Vercel》](https://playwright.tech/blog/generate-opengraph-images-using-playwright 'Vercel Generate Open Graph')

核心代码如下。

```js
import chromium from 'chrome-aws-lambda'
import playwright from 'playwright-core'

const getAbsoluteURL = (path) => {
  const baseURL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  return baseURL + path
}

export default async function handler(req, res) {
  // Start the browser with the AWS Lambda wrapper (chrome-aws-lambda)
  const browser = await playwright.chromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  })
  // 创建一个页面，并设置视窗大小
  const page = await browser.newPage({
    viewport: {
      width: 1200,
      height: 630,
    },
  })
  // 从url path 拼接成完成路径
  const url = getAbsoluteURL(req.query['path'] || '')
  await page.goto(url, {
    timeout: 15 * 1000,
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(1000)
  // 生成png 的缩略图
  const data = await page.screenshot({
    type: 'png',
  })
  await browser.close()
  // 设置图片强缓存
  res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate')
  res.setHeader('Content-Type', 'image/png')
  // 设置返回 Content-Type 图片格式
  res.end(data)
}
```

`chrome-aws-lambda` 是为了 serverless 环境定制的 chrome 内核，包大小比较小，我将这段代码部署上去，通过 url 拼接的方式访问，我们就可以生成当前页面的缩略图了；

大家可以通过 https://code.runjs.cool/api/thumbnail?path=/pen/create 这个地址访问体验。
虽然有点慢，但是可以生成缩略图

![vercel 生成的缩略图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf09c226ff054c178fb2b7dcc40a834f~tplv-k3u1fbpfcp-zoom-1.image)

有个问题就是，右上角的“保存”无法显示，查了下[github](https://github.com/alixaxel/chrome-aws-lambda 'chrome-aws-lambda') chrome-aws-lambda 不包含任何字体，所以要支持中文，先要加载中文字体

readme 中有 demo

```js
await chromium.font('/var/task/fonts/NotoColorEmoji.ttf')
// or
await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf')
```

字体可以下载阿里巴巴普惠体，由于中文字体比较大，我就没有尝试，既然速度慢，那能否试试国内的云环境呢？

## uniapp

由于我使用的云存储是 uniapp，那么我将尝试下 uniapp 的云函数。

### 本地尝试

于是我建立了一个云函数，然后在本地运行云函数。

首先安装使用 npm 安装 puppeteer `npm i puppeteer`

输入云函数代码

```js
const puppeteer = require('puppeteer')

exports.main = async (event, context) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://baidu.com')
  const path = `${__dirname}/img.png`
  await page.screenshot({ path })
  await browser.close()
  return 1
}
```

执行完成后就在本地生成`img.png`文件，效果如下图

![puppeteer 百度首页截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1d376a2e3de409392bb0967d42a58fa~tplv-k3u1fbpfcp-zoom-1.image)

没错，生成的是一张`800*600` 大小的浏览器截图，感觉没问题了。

### 阿里云

于是我就按这个逻辑写完了云函数，当我点击`上传部署` 的时候，HbuildX 就没有进度，一直处于上传中，查了下资料，应该是 puppeteer 本身依赖了 Chromium，Chromium 又依赖非常多的系统库，无法在云函数上安装完成。

但是我在阿里云官网找到了一篇文章

[《Serverless 实战 —— 快速开发一个分布式 Puppeteer 网页截图服务》](https://developer.aliyun.com/article/727915 '阿里云 Puppeteer 网页截图服务')

按这篇文章讲述的是阿里云是支持 Puppeteer，由于 puppeteer 比较大，云函数会自动开通 NAS 服务（文件存储）

**所以 uniapp 中选择服务商选择阿里云，云函数式不支持 puppeteer 的**

### 腾讯云

那么腾讯云支持吗？后来我又查到腾讯云云函数中内置了 puppeteer，可以在[文档](https://cloud.tencent.com/document/product/583/11060 '腾讯云函数内置 puppeteer')中找到，**注意（nodejs 16）已经不支持 puppeteer**

于是我又尝试了腾讯云函数，代码如下

```js
const puppeteer = require('puppeteer')

exports.main = async (event, context) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.goto('https://baidu.com')
  const res = await page.screenshot()
  await browser.close()

  return {
    isBase64Encoded: true,
    statusCode: 200,
    headers: {
      'content-type': 'image/png',
      'Cache-Control': 's-maxage=31536000, stale-while-revalidate',
    },
    body: res.toString('base64'),
  }
}
```

此时不需要 package.json，上传后，云函数 URL 化，

体验地址：

https://tcb-mtsm4smjc8dbf7-8dkm6932475ab.service.tcloudbase.com/baidu

效果

![腾讯云函数 puppeteer 缩略图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae3c508ea3db4389a7667004de22c163~tplv-k3u1fbpfcp-zoom-1.image)

应该是满足了我们的需求。

## 小结

本文介绍了生成缩略图的方式

1. dom-to-img 客户端生成，但是用户的浏览器大小不一，缩略图大小不一样。

2. vercel 可以配合 chrome-aws-lambda 可以生成缩略图，但是必须要先加载字体。

3. uniapp 免费的阿里云函数不支持 Puppeteer，可以直接使用阿里云的 serverles 服务，但是要开通 NAS。

4. 腾讯云函数系统内置 Puppeteer，免安装，应该是比较不错的方案。

最后贴一下我项目地址和代码

预览地址：https://code.runjs.cool/pen/create

代码仓库：https://github.com/maqi1520/next-code-pen

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
