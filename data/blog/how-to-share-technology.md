---
title: '如何快速在团队内做一次技术分享？'
date: '2022/6/25'
lastmod: '2022/6/25'
tags: [前端, 程序员, markdown]
draft: false
summary: '本文讲述了我在准备团队内容分享的小技巧，我认为最重要的就是结合公司实际来做分享修改，无论主题也好文章内容也罢，虽然文章是别人写的，但要经过自己的思考和消化，变成自己的知识，这样我们才可以快速成长！'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34f290e9620741c0800479815b859b91~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

相信很多小伙伴跟我一样，是一位奋斗在一线的业务开发，每天有做不完的任务，还有项目经理在你耳边催你，“这个功能今天能完成吗？”其实作为一名前端工程师，任务就是完成 Leader 的任务，
但公司实行 OKR 以来，你就不得不在完成任务的基础上加上几条，“提示个人能力”是我任务之外一个长期目标。
![提升个人能力OKR](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92b8b891b96d4d40908d53a275010cfa~tplv-k3u1fbpfcp-zoom-1.image)

为了能完成这个目标，团队内部分享就成了这个目标的关键结果，那么如何在短时间内完成这项任务呢？下面分享下我的技巧。

## 明确主题

首先我们要明确公司需要什么？我们不能随便搞一个知识点去分享，这样没有人愿意去听，比如公司接下来可能会上前端监控系统，那么我们可以在先做一个技术调研，出一个《前端监控体系搭建要点》，比如公司接下来需要做小程序，那么我们可以出一个《小程序跨端实现方案探索》等，如果没有什么新的功能要开发，那么我们也可以谈一谈《前端性能优化》、《Typescript 快速上手》，总之要明确一个切合实际的目标。

## 巧用搜索引擎

确定好主题后，我们可以在技术社区搜索相关的技术文章，比如掘金、知乎、思否、微信公众号等，
比如直接在掘金搜索“性能优化” 然后按热度排序，就可以找到不错的文章。

![掘金搜索性能优化](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89fed10ba7b64901a236e155240cc708~tplv-k3u1fbpfcp-zoom-1.image)

接下来我们需要根据这些文章中的内容制作 PPT

## 使用 markdown 来制作 PPT

程序员做 PPT 可能会浪费不少时间，所以我选择是 markdown 来制作 PPT，这里我分享 2 个工具

**[Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode 'Marp for VS Code') vscode 插件**
![Marp for VS Code](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6caa6ceaa1e44dfbdea6968b79da91d~tplv-k3u1fbpfcp-zoom-1.image)
只用关注内容，简单分隔一下，就可以制作 PPT，看下 marp 官方文档可以很快学会用法，看看 jeremyxu 写的效果，项目地址:[kubernetes 分享 PPT 源文件](https://github.com/jeremyxu2010/k8s-share 'kubernetes 分享 PPT 源文件') 。

![Marp kubernetes 分享 PPT](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/305b90569f0a43d8b26ad38fd5f71f04~tplv-k3u1fbpfcp-zoom-1.image)

**二： Slidev 也可以让我们用 Markdown 写 PPT 的工具库**

官网地址：[https://sli.dev](https://sli.dev)， 基于 Node.js、Vue.js 开发，而且它可以支持各种好看的主题、代码高亮、公式、流程图、自定义的网页交互组件，还可以方便地导出成 PDF 或者直接部署成一个网页使用。

- 演讲者头像

当然还有很多酷炫的功能，比如说，我们在讲 PPT 的时候，可能想同时自己也出镜，Slidev 也可以支持。

![演讲者头像](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95a5e2eee06b4021824b7edaa984edc4~tplv-k3u1fbpfcp-zoom-1.image)

- 演讲录制

Slidev 还支持演讲录制功能，因为它背后集成了 WebRTC 和 RecordRTC 的 API，

![演讲录制](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13065941a14441e7b5322f20ee168127~tplv-k3u1fbpfcp-zoom-1.image)

## 文章转 markdown

![文章拷贝助手油猴扩展](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f1e838aaab74cb6b7225da6fe0f2e27~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

这里推荐下我写的油猴扩展

- 第一步： [安装 chrome 油猴扩展](https://chrome.pictureknow.com/extension?id=4d999497b75d4eb6acf4d0db3053f1af '安装 chrome 油猴扩展')
- 第二步： [安装文章拷贝助手](https://greasyfork.org/zh-CN/scripts/439663-copy-helper '安装文章拷贝助手')

可以直接将文章转为 markdown 格式，目前已经支持掘金、知乎、思否、简书、微信公众号文章。

接下来就根据 H2 分页组织 PPT 内容即可。

```md
---
layout: cover
---

# 第 1 页

This is the cover page.

<!-- 这是一条备注 -->
```

较长的内容可以将内容改为幻灯片编写备注。它们将展示在**演讲者模式**中，供你在演示时参考。

## 小结

本文讲述了我在准备团队内容分享的小技巧，我认为最重要的就是结合公司实际来做分享修改，无论主题也好文章内容也罢，虽然文章是别人写的，但要经过自己的思考和消化，变成自己的知识，这样我们才可以快速成长！在此，祝各位小伙伴在能够获知识的同时得较高的 OKR 考核。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
