---
title: iPad 编程生产力
date: 2022/8/27 14:39:51
lastmod: 2023/1/25 11:43:13
tags: [前端, 产品]
draft: false
summary: 前言 iPad 有个口号，就是“买前生产力，买后爱奇艺”，使用 iPad，配合 Procreate 来作画体验还可以， 如果你想让你的 iPad 可以编程，你却不得不为之花费时间和精力。
images: https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f15d939d1f104423bf6bc8130f3e6b78~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

iPad 有个口号，就是“买前生产力，买后爱奇艺”，使用 iPad，配合 Procreate 来作画体验还可以， 如果你想让你的 iPad 可以编程，你却不得不为之花费时间和精力，我搜了网上的教程，大致可以总结为以下 2 步：

- 第一步：租个服务器，租一台云服务器，阿里云、腾讯云、华为云都可以；
- 第二步：iPad 上下载安装 Termius，然后就可以通过 Vim 编程了；

![Termius](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e169e71ec1da427f9bda1bee05a55e90~tplv-k3u1fbpfcp-zoom-1.image)

经过一晚上的配置和折腾，花钱不说，虽然可以实现在 iPad 上编程的需求，但体验远却比不上 PC，今天我就来推荐一种新的方式，让你的 iPad 变成真正的生产力工具。

## Cloud Studio 简介

Cloud Studio 是基于浏览器的集成式开发环境（IDE），为开发者提供了一个永不间断的云端工作站。用户在使用 Cloud Studio 时无需安装，随时随地打开浏览器就能使用。

![Cloud Studio iPad 编程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/944518272366405c8c0c01eb1ad858cd~tplv-k3u1fbpfcp-zoom-1.image)
以上是我用 iPad 浏览器，在 1 分钟内初始化了一个 next 初始化模板，可以说速度比本地开发还快，当我在左侧修改代码时，右侧预览界面便会同步热更新。

![Cloud Studio 安装 react snippts  ](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec5af0bfbcf24e3fad35978a2078a4fc~tplv-k3u1fbpfcp-zoom-1.image)

Cloud Studio 可以说是提供了一台云服务器，并且把 VSCode 搬到了线上，我们可以同本地开发一样，在上面安装插件，比如可以在左侧扩展中搜索 react，安装这个 react snippts 扩展，便可以帮助我们提供常用代码片段，快速创建组件。

## 支持语言和模板

目前，Cloud Studio 全面支持 Java Spring Boot、 Go、.NET、Python、Node.js 等丰富的开发模版示例库，具备在线开发、调试、预览、端口自动识别等能力。同时，Cloud Studio 已经集成在线开发协作模块，开发者能够随时随地设计、讨论和开发。

![Cloud Studio 支持的模板](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2002fe163434f8bbf54454566dd2676~tplv-k3u1fbpfcp-zoom-1.image)

我们可以选择熟悉的语言和模板进行开发。

## 部署

Cloud Studio 具备标准化的云端安装部署能力，支持主流代码仓库的云端克隆，比如我创建的 next 应用，可以点击左侧的小飞机图标，可以部署到腾讯云或者阿里云的 serverless 环境

![Cloud Studio 部署](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/465a5de4edf7420d97cdabc96c3125b6~tplv-k3u1fbpfcp-zoom-1.image)

我这里点击腾讯云，使用微信扫码登录后便可以直接部署到腾讯云 serverless

![Cloud Studio 部署成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05894e129cda4218bb1f972edf815265~tplv-k3u1fbpfcp-zoom-1.image)

部署完成后点击访问按钮，便会打开部署完成后的地址，访问在线地址。

## 自定义模板

我习惯了使用 Next.js 和 Tailwindcss 来做我项目的初始化模板，那么我每次初始化项目的时候都需要重新配置 Tailwindcss 吗？并不是，Cloud Studio 推出了自定义模板的功能，主要包含四个方面，创建、发布、分享和管理，具体大家看[参考文档](https://cloudstudio.net/docs/guide/custom-template.html)

![Cloud Studio 发布自定义模板](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1537cfa2642c46ce9b68a4138f758fda~tplv-k3u1fbpfcp-zoom-1.image)

在菜单上点击“发布自定义模板”

![Cloud Studio 发布自定义模板](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17940a2596e843e7b1351a640796f150~tplv-k3u1fbpfcp-zoom-1.image)

填写相关信息后，便可以发布一个熟悉的模板了。

## 协作编程

Cloud Studio 还有个强大的功能就是协作编程，开发者只需要点击左侧导航上的多人协作按钮，然后点击开发发起协作，控制台便会自动复制协作链接
![Cloud Studio 协作编程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b3715e64efd4007b3b420667cd40ca5~tplv-k3u1fbpfcp-zoom-1.image)
将协作链接发送给协作伙伴，当协作伙伴点击链接，会在下方提示是否允许加入。

![Cloud Studio 协作编程跟随效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cf4a0797cf8490299ecc21b3bcd5c0a~tplv-k3u1fbpfcp-zoom-1.image)

协作伙伴加入后，我们就可以实时看到协作伙伴的操作和编码了。

## 关于计费

当然提供开发的标准型云服务器( 2 核 4 GB) 并不是完全免费的，每月赠送 1000 分钟时长，当我们开始使用工作空间时，就会开始每 10 分钟计费，从我们每个月 1000 分钟的额度里扣除相应的时长，所以如果不用工作空间的时候千万要记得停止工作空间。

点击工作空间后方的停止按钮即可停止计费，同时工作空间停止运行。

![Cloud Studio  停止服务](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a96d5d1210c4b38b9a1eb69a110fa73~tplv-k3u1fbpfcp-zoom-1.image)

## 使用自托管云主机

上面说的使用模板的工作空间是付费制的，会消耗每个月 1000 分钟的额度，如果你觉得每个月 1000 分钟不够的话，那么除了付费，你还可以将工作空间连接至自己的云服务器，这样就可以通过 Cloud Studio 在自己的云服务器中运行程序和开发了。

![Cloud Studio 使用自托管云主机](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84a72438b03340cda14686073b7bfa59~tplv-k3u1fbpfcp-zoom-1.image)

选择云主机

![Cloud Studio 使用自托管云主机](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24c7a3e6249e4ff6befa88f3d96b9412~tplv-k3u1fbpfcp-zoom-1.image)

输入 IP 用户名和密码，便可以连接自己的服务器，在 Cloud Studio 中进行开发了。

![Cloud Studio 使用自托管云主机成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/741a969d6ead46439caf99232f8034a2~tplv-k3u1fbpfcp-zoom-1.image)

默认是在 `root/RemoteWorking`目录下，我目前还没发现修改目录的位置，因为是自托管的云主机，所以除了服务器自带的环境，其他的环境都需要自行配置，这里不再详细阐述。

## 使用感受

- Cloud Studio 做到了开发环境零配置，让我们随时随地只要有网络就可以进行开发，让 iPad 也成为了编程利器；
- Cloud Studio 极大地降低了开发者对环境部署的要求，可轻松将应用部署上线;
- Cloud Studio 在协作编程、网络教学、远程面试等环节中将会发挥巨大作用;

Cloud Studio 还很新，我在使用中，遇到了一个关于模板发布的问题，我加入了 Cloud Studio 问题反馈群，经过群里小伙伴的细心排查，也得到了解决。最后，希望 Cloud Studio 越来越好。

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
