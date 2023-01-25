---
title: 用 React 开发了一款 Chrome 插件【七牛云图床】
date: 2022/12/21 20:45:32
lastmod: 2023/1/25 11:42:10
tags: [Chrome, React.js]
draft: false
summary: 习惯使用 markdown 写作的朋友，肯定会有自己的图床，七牛云的对象存储对于个人用户每月免费 10GB，可谓是白嫖的上上之选，只需要注册后，绑定一个域名就可以使用了。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e175f73ce70642b4af2b58d4de3118a4~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

习惯使用 markdown 写作的朋友，肯定会有自己的图床，七牛云的对象存储对于个人用户每月免费 10GB，可谓是白嫖的上上之选，只需要注册后，绑定一个域名就可以使用了。

我之前使用的是一款开源的软件 [PicGo](https://github.com/Molunerfinn/PicGo/)，它使用的时候 Electron+vue 开发，支持七牛图床、腾讯云 COS、阿里云 OSS、GitHub 等，可谓是非常方便。

我们知道使用了 Electron 相当于打包了一个 chromium，因此安装包会比较大，今天我打算使用浏览器扩展来完成同样的功能。

## 效果演示

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbc54ec7c0ce483c8a660d947455f415~tplv-k3u1fbpfcp-watermark.image?)

支持手动上传和剪切板上传，并且自动复制到剪切板

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be1c5f66221943d4ab2f3e6d950b38fc~tplv-k3u1fbpfcp-zoom-1.image '历史记录')

上传后，可以查看历史记录，点击复制 url。

由于发布的 chrome 应用市场需要 5 美元，因此只提供的[源码](https://github.com/maqi1520/extension-qiniu-pic '源码')的安装方式，感兴趣的朋友可以安装试试。

## chrome 插件介绍

chrome 插件相当于一个静态网页，但远比静态网页功能强大，chrome 插件通常由以下几部分组成：

- `manifest.json`：相当于插件的 meta 信息，包含插件的名称、版本号、图标、脚本文件名称等，这个文件是每个插件都必须提供的，其他几部分都是可选的。
- `background script`：可以调用全部的 chrome 插件 API，实现跨域请求、网页截屏、弹出 chrome 通知消息等功能。相当于在一个隐藏的浏览器页面内默默运行。
  功能页面：包括点击插件图标弹出的页面（简称 popup）、插件的配置页面（简称 options）。
- `content script`：是插件注入到页面的脚本。`content script` 可以操作 DOM，但是它和页面其他的脚本是隔离的，访问不到其他脚本定义的变量、函数等，相当于运行在单独的沙盒里。`content script` 可以调用有限的 chrome 插件 API，通知到 `background script` ，实现网络请求。

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4505e136c46b48508ed62ce95fe9c08e~tplv-k3u1fbpfcp-watermark.image?)

配置这些参数很麻烦？ 我们可以使用一个框架帮我们自动搞定。

## Plasmo 框架

我选用的是 Plasmo。

Plasmo 框架是一个开源的浏览器扩展 SDK，支持所有主流的浏览器，构建你的插件，无需担心配置文件编写和构建浏览器扩展时的奇怪特性，plasmo 帮助我们屏蔽了底层的差异。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/faf35213cae44b288a17d7ebbc4dea43~tplv-k3u1fbpfcp-zoom-1.image)

- 支持 React + Typescript
- 声明式开发，自动生成 manifest.json (MV3)
- 热加载

### 初始化项目

使用下面的命令初始化项目：

```bash
pnpm dlx plasmo init
# 或者使用 npm v7
npm x plasmo init
```

上面的命令会创建一个最简单的 plasmo 浏览器插件项目，结构很简单。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b2d27751c3f491cbbccd0e6efdaea50~tplv-k3u1fbpfcp-zoom-1.image)

- `popup.tsx` 该文件为默认的弹窗窗口入口文件。这就是你在插件弹出窗口上所需的全部内容！
- `assets` Plasmo 会自动生成一些小的图标并将它们从 icon512.png 文件中配置到清单中
- `package.json` 处理管理依赖包，也可以管理插件的 manifest 信息
- `tsconfig.json` TypeScript 配置文件

要开发插件，执行

```bash
pnpm dev
```

会在 `build/chrome-mv3-dev`目录下构建出开发中的插件代码，将这个文件夹拖入到 `chrome://extensions/` 就可以查看效果了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52603cfdf5074c68ae7238ae085b4f5f~tplv-k3u1fbpfcp-zoom-1.image)

然后将扩展程序固定到 Chrome 工具栏可以更方便访问。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f79b34ec1a743b4b3245a5015802de3~tplv-k3u1fbpfcp-zoom-1.image)

要打包插件，执行

```bash
pnpm build
```

会在 `build/chrome-mv3-build`目录下， 构建出压缩后的插件代码，安装与上面的方式相同。

## 存在问题

上传图片主要使用到的是 `qiniu-js`，这个是七牛云官方的 js-sdk，大家去看文档就可以了。

由于七牛云上传 js-sdk 需要使用到 `token`，而 token 是在服务端生成的，但我们的实现的是一个 chrome 插件，也就是没有服务端， 若在纯客户端实现，需要使用到 `crypto-js`，一个加密的 JavaScript 标准库。

运行 build 会在根目录下，生成`.plasmo`文件夹，为真实的入口文件。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16e0449b0498414eaf4c937f2b21e718~tplv-k3u1fbpfcp-zoom-1.image)

可以看出 `plasmo` 是使用 `parcel` 来打包的。现在运行 `npm run build`，会在命令行中提示以下错误。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/190fda5d3808423b8dab3d666033a9df~tplv-k3u1fbpfcp-zoom-1.image)

也没提示那个文件打包错误。

经过测试后发现，因为项目中包含 `crypto-js`，而 `crypto-js` 的加载方式是 umd，目前还没解决，这就是 plasmo 的劣势吧，其实我们可以使用 webpack 来配置实现，只不过需要手动维护 `manifest.json `的相关信息。

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
