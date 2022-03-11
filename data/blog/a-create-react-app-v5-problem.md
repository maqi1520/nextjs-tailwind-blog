---
title: '一个 create-react-app v5 的问题'
date: '2022/2/16'
lastmod: '2022/3/11'
tags: [React.js]
draft: false
summary: '前两天我准备用 create-react-app 创建一个新项目，然后遇到了一个问题，涉及到 npx'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae71deff8af74f60a6031fa9eedc6ec3~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

前两天我准备用 `create-react-app` 创建一个新项目，然后我在命令行下执行

```bash
npx create-react-app my-app
```

命令行下就会提示

```bash
Need to install the following packages:
  create-react-app
Ok to proceed? (y) y

You are running `create-react-app` 4.0.3, which is behind the latest release (5.0.0).

We no longer support global installation of Create React App.

Please remove any global installs with one of the following commands:
- npm uninstall -g create-react-app
- yarn global remove create-react-app

The latest instructions for creating a new app can be found here:
https://create-react-app.dev/docs/getting-started/
```

提示意思是：`create-react-app` 从第五版本开始不再需要全局安装，让我先卸载 `create-react-app`。

然后我就输入 `npm uninstall -g create-react-app` 进行全局卸载，然后再执行 `npx create-react-app my-app` 创建，结果还是上面的提示。

## npx 介绍

npm 从 5.2 版开始，增加了 npx 命令。它有很多用处，主要使用有以下场景。

### 调用项目中的安装模块

原先要执行

```bash
node-modules/.bin/jest
```

代替

```bash
npx jest
```

### 避免全局安装模块

```bash
npx create-react-app my-app
```

上面代码运行时，npx 将`create-react-app`下载到一个临时目录，使用以后再删除。

然后我去 google 搜索答案，找到了这个[issue](https://github.com/facebook/create-react-app/issues/11816)，上面回答了一些解决办法。

### 使用不同版本的 node

利用 `npx` 可以下载模块这个特点，可以指定某个版本的 Node 运行脚本。它的窍门就是使用 npm 的  [node 模块](https://www.npmjs.com/package/node)。

```bash
npx node@0.12.8 -v
```

上面命令会使用 0.12.8 版本的 Node 执行脚本。原理是从 npm 下载这个版本的 node，使用后再删掉。

某些场景下，这个方法用来切换 Node 版本，要比 nvm 那样的版本管理器方便一些。

### 执行 GitHub 源码

`npx` 还可以执行 GitHub 上面的模块源码。

执行 Gist 代码

```js
npx https://gist.github.com/zkat/4bc19503fe9e9309e2bfaa2c58074d32
```

执行仓库代码

```js
npx github:piuccio/cowsay hello
```

注意，远程代码必须是一个模块，即必须包含`package.json`和入口脚本

## 原因

产生这个问题的原因是 `npx` 是有缓存的，但全局卸载后，`npx` 的缓存还在。

## 解决办法

方案一
使用固定版本号

```bash
npx create-react-app@5 <PROJECT_NAME>
```

方案二
使用 `npm init`代替

```bash
npm init react-app my-app
```

方案三  
先清除 `npx` 缓存然后在初始化

```bash
npx clear-npx-cache
npx create-react-app my-app
```

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/a-create-react-app-v5-problem)
