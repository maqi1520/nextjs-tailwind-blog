---
title: '我用 nodejs 爬了一万多张小姐姐壁纸'
date: '2022/3/23'
lastmod: '2022/3/23'
tags: [Node.js]
draft: false
summary: '本文主要讲述如何使用 nodejs 爬虫，以及如何用nodejs 下载图片。为什么要下载这么多图片呢？ 前几天使用 uniapp + uniCloud 免费部署了一个壁纸小程序。'
layout: PostLayout
---

## 前言

哈喽，大家好，我是小马，为什么要下载这么多图片呢？
前几天使用 uniapp + uniCloud 免费部署了一个壁纸小程序，那么接下来就需要一些资源，给小程序填充内容。

## 爬取图片

首先初始化项目，并且安装 `axios` 和 `cheerio`

```bash
npm init -y && npm i axios cheerio
```

`axios` 用于爬取网页内容，`cheerio` 是服务端的 jquery api, 我们用它来获取 dom 中的图片地址；

```js
const axios = require('axios')
const cheerio = require('cheerio')

function getImageUrl(target_url, containerEelment) {
  let result_list = []
  const res = await axios.get(target_url)
  const html = res.data
  const $ = cheerio.load(html)
  const result_list = []
  $(containerEelment).each((element) => {
    result_list.push($(element).find('img').attr('src'))
  })
  return result_list
}
```

这样就可以获取到页面中的图片 url 了。接下来需要根据 url 下载图片。

## 如何使用 nodejs 下载文件

### 方式一：使用内置模块 ‘https’ 和 ‘fs’

使用 node js 下载文件可以使用内置包或第三方库完成。

GET 方法用于 HTTPS 来获取要下载的文件。 `createWriteStream()` 是一个用于创建可写流的方法，它只接收一个参数，即文件保存的位置。`Pipe()`是从可读流中读取数据并将其写入可写流的方法。

```js
const fs = require('fs')
const https = require('https')

// URL of the image
const url = 'GFG.jpeg'

https.get(url, (res) => {
  // Image will be stored at this path
  const path = `${__dirname}/files/img.jpeg`
  const filePath = fs.createWriteStream(path)
  res.pipe(filePath)
  filePath.on('finish', () => {
    filePath.close()
    console.log('Download Completed')
  })
})
```

### 方式二：DownloadHelper

```bash
npm install node-downloader-helper
```

下面是从网站下载图片的代码。一个对象 dl 是由类 DownloadHelper 创建的，它接收两个参数:

1. 将要下载的图像。
2. 下载后必须保存图像的路径。

File 变量包含将要下载的图像的 URL，filePath 变量包含将要保存文件的路径。

```js
const { DownloaderHelper } = require('node-downloader-helper')

// URL of the image
const file = 'GFG.jpeg'
// Path at which image will be downloaded
const filePath = `${__dirname}/files`

const dl = new DownloaderHelper(file, filePath)

dl.on('end', () => console.log('Download Completed'))
dl.start()
```

### 方法三： 使用 **download**

是 npm 大神 [sindresorhus](https://github.com/kevva/download/commits?author=sindresorhus 'View all commits by sindresorhus') 写的，非常好用

```bash
npm install download
```

下面是从网站下载图片的代码。下载函数接收文件和文件路径。

```js
const download = require('download')

// Url of the image
const file = 'GFG.jpeg'
// Path at which image will get downloaded
const filePath = `${__dirname}/files`

download(file, filePath).then(() => {
  console.log('Download Completed')
})
```

## 最终代码

本来想去爬百度壁纸，但是清晰度不太够，而且还有水印等，后来， 群里有个小伙伴找到了一个 api，估计是某个手机 APP 上的高清壁纸，可以直接获得下载的 url，我就直接用了。

下面是完整代码

```js
const download = require('download')
const axios = require('axios')

let headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
}

function sleep(time) {
  return new Promise((reslove) => setTimeout(reslove, time))
}

async function load(skip = 0) {
  const data = await axios
    .get(
      'http://service.picasso.adesk.com/v1/vertical/category/4e4d610cdf714d2966000000/vertical',
      {
        headers,
        params: {
          limit: 30, // 每页固定返回30条
          skip: skip,
          first: 0,
          order: 'hot',
        },
      }
    )
    .then((res) => {
      return res.data.res.vertical
    })
    .catch((err) => {
      console.log(err)
    })
  await downloadFile(data)
  await sleep(3000)
  if (skip < 1000) {
    load(skip + 30)
  } else {
    console.log('下载完成')
  }
}

async function downloadFile(data) {
  for (let index = 0; index < data.length; index++) {
    const item = data[index]

    // Path at which image will get downloaded
    const filePath = `${__dirname}/美女`

    await download(item.wp, filePath, {
      filename: item.id + '.jpeg',
      headers,
    }).then(() => {
      console.log(`Download ${item.id} Completed`)
      return
    })
  }
}

load()
```

上面代码中先要设置 `User-Agent` 并且设置 3s 延迟， 这样可以防止服务端阻止爬虫，直接返回 403。

直接 `node index.js` 就会自动下载图片了。

![爬取运行中](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea62f4b6d6d643eda94cc36fcc269c5d~tplv-k3u1fbpfcp-watermark.image?)

## 体验

微信小程序搜索 [“西瓜图库”](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5301b8b97094e92bfae240d7eb1ec5e~tplv-k3u1fbpfcp-zoom-1.awebp?) 体验。

## 最后

上面说的群是 @大帅老猿 大帅带领的“猿创营”，群里有很多开发大佬可以互相帮忙答疑和交流技术，同时大帅还会分享做外包，搞副业等，感兴趣的小伙伴可以留言“入群”。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/node-reptile)
