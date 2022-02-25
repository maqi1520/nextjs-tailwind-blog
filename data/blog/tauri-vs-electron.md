---
title: '初步尝试 tauri，并且与 electron.js 对比 '
date: '2022/2/1'
lastmod: '2022/2/1'
tags: [前端, JavaScript]
draft: false
summary: 'Tauri 是一个为所有主流桌面平台构建小型、快速二进制文件的框架。开发人员可以集成任何编译成 HTML、 JS 和 CSS 的前端框架来构建他们的用户界面。'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/636408c5873b4999ad2d4b03665e452f~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 什么是 Tauri?

> Tauri 是一个为所有主流桌面平台构建小型、快速二进制文件的框架。开发人员可以集成任何编译成 HTML、 JS 和 CSS 的前端框架来构建他们的用户界面。应用程序的后端是一个 Rust 二进制文件，具有前端可以与之交互的 API。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1208177f6dae4a538c4c01e574433ef0~tplv-k3u1fbpfcp-watermark.image?)

在 2021 年 star 排行榜单中，[`tauri`](//tauri.studio) 一年增长了 18k 排名第五，我们就很好奇，Tauri 有什么优势呢？

然后我分别用 tauri 和 Electron.JS 打包测试一个 hello world 程序，一起来看下它们的大小。

## 大小对比

- Electron.JS `62.5`mb
- Tauri `4.32`mb

`Tauri` 构建的桌面程序太小了，远不是 Electron.JS 可以相比的，因为它放弃了体积巨大的  `Chromium` 内核   和  `nodejs`，前端使用操作系统的  `webview`，后端集成了  `Rust`。
Tauri 提供了初始化程序的模板，比如原生 js, `react`, `svelte.js`, `vue.js` 等等。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/604a600e0a214207bd540d99bdd01639~tplv-k3u1fbpfcp-watermark.image?)

从[ MOBILE when?](https://github.com/tauri-apps/tauri/issues/843) 这条 issues 看,
Tauri 团队也正在努力支持 `Android` and `IOS`.这是不是有点小期待呢？

## 开始尝试 Tauri

因为 Tauri 是一个多语言的工具链，涉及安装有点复杂。

我这边是 macos 系统

1、 首先要安装 gcc 编译器

```
$ brew install gcc
```

homebrew 可以先切换清华大学的源，
需要先安装 homebrew， 下面命令是 homebrew 的国内安装地址

**安装 homebrew**

```bash
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

2、 确保已经安装 xcode

```
xcode-select --install
```

3、安装 Nodejs 运行环境 和包管理工具 yarn

这一步前端都已经装了

4、安装是 Rust 编程语言的编译器 rustc

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/652dbc67c7c048329f9dbcbdf909fa1e~tplv-k3u1fbpfcp-watermark.image?)

然后就可以使用官方 cli 初始化程序了。

```bash
yarn create tauri-app
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/107f5cf3c28149b989162a16b4a59637~tplv-k3u1fbpfcp-watermark.image?)

然后要在项目目录下初始化

```
yarn tauri init
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6af046f9d85e4bb79f19633bb7eee8af~tplv-k3u1fbpfcp-watermark.image?)

这一步骤很慢，我不清楚是否是我没指定 rust 国内源，知道的小伙伴可以在评论区留言。
完成之后执 `yarn start` 就跟开发 react 程序一样，就可以实时热更新了。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/853ffe4932ec4a39adb7ff826e2c3699~tplv-k3u1fbpfcp-watermark.image?)

第一次运行这个命令时，Rust 包管理器需要几分钟时间下载并构建所有需要的包，后续的构建会快得多，因为它们是有缓存的。

**客户端开发启动命令**

`yarn tauri dev`

右键也可以审查元素

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/005445163e774f92b36892bdcc2a4ad9~tplv-k3u1fbpfcp-watermark.image?)

**打包客户端**

`yarn tauri build `

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e02449a1c3a0431db9f5dbb8774aea3e~tplv-k3u1fbpfcp-watermark.image?)

## 与 Electron 对比

我们可以通过官方 github Readme 查看与 electron [对比](https://github.com/tauri-apps/tauri#comparison-between-tauri-and-electron)

### Comparison between Tauri and Electron

| 详细             | Tauri  | Electron             |
| ---------------- | ------ | -------------------- |
| 安装包大小 Linux | 3.1 MB | 52.1 MB              |
| 内存消耗 Linux   | 180 MB | 462 MB               |
| 启动时间 Linux   | 0.39s  | 0.80s                |
| 界面服务提供     | WRY    | Chromium             |
| 后端绑定         | Rust   | Node.js (ECMAScript) |
| 潜在引擎         | Rust   | V8 (C/C++)           |
| FLOSS            | Yes    | No                   |
| 多线程           | Yes    | Yes                  |
| 字节码交付       | Yes    | No                   |
| 多多窗口         | Yes    | Yes                  |
| 自动更新         | Yes    | Yes1                 |
| 自定义 App Icon  | Yes    | Yes                  |
| Windows Binary   | Yes    | Yes                  |
| MacOS Binary     | Yes    | Yes                  |
| Linux Binary     | Yes    | Yes                  |
| iOS Binary       | Soon   | No                   |
| Android Binary   | Soon   | No                   |
| Desktop Tray     | Yes    | Yes                  |
| Sidecar Binaries | Yes    | No                   |

## 小结

这次尝试,只是从 web 层，并没有涉及系统 后端，需要学一些 rust 相关的知识。若单纯 web 程序打包，使用 `tauri` 会更小，若熟悉 node.js api 的还是推荐 `electron.js` ，毕竟 `vscode` 这么大的程序也是 `electron.js` 构建的。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
