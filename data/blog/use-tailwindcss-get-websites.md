---
title: '如何使用 Tailwind CSS 写官网？'
date: '2023/2/22'
lastmod: '2023/2/22'
tags: [CSS]
draft: false
summary: '上在上一期视频中，我介绍了 Tailwindcss 的优点，很多小伙伴也在评论中谈论了自己的看法。
今天这期视频我们就来实战一下，如何使用 Tailwindcss 写官网？那么一起来看看吧'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11bd60c4ea2d436c8aa83e349158b96d~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

<Video src="//player.bilibili.com/player.html?aid=864473804&bvid=BV1454y1P7sa&cid=1009495160&page=1" />

## 前言

在上一期视频中，我介绍了 Tailwindcss 的优点，很多小伙伴也在评论中谈论了自己的看法。
今天这期视频我们就来实战一下，如何使用 Tailwindcss 写官网？那么一起来看看吧

## tailblocks.cc

首先推荐一个网站 tailblocks.cc， 它拥有 50+ 代码块，在右上角可以切换网站主题颜色，所有的代码块都是响应式的，并且支持暗黑皮肤。
通过键盘左右键可以快速切换、预览效果。

![tailblocks.cc](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d327ccfb18b44b418f9fc8c179440058~tplv-k3u1fbpfcp-watermark.image?)

接下来我们就在 tailwindcss playground 中实现

## 网站

在开始之前，先说一下网站有几个组成部分, 包括

HEADER 头部

HERO

CONTENT 内容

GALLERY 画廊

BLOG 博客

TEAM 团队

CONTACT 联系

FOOTER 底部

接下来我们就按以上顺序依次拷贝代码块

我们就以上布局实现代码

## 替换图片

此时，网站的整体结构已经出来了，但是图片还是虚拟图片，看上去很单调，这些图片是由 dummyimage 这个网站生成的，并且图片的尺寸可以直接修改。

那么我们可以使用另一个网站 unsplash 来生成随机的高清图片，并且使用正则表达式来替换。

这个 book 代表搜索的关键词，这个 unsplash 的 api 用于生成随机高清图片

https://dummyimage.com/(\d+)x(\d+)

https://source.unsplash.com/$1x$2/?book

最后我们一起来看下效果。

https://play.tailwindcss.com/Rcu7njIayY?layout=preview
