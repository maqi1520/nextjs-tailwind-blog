---
title: '实现一个 Code Pen：（一）项目初始化'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '前段时间掘金上线了一个新功能 Code pen，可以在线写代码，笔者对这种在线实时编辑的功能充满了好奇，所以打算开发一个简易的 Code pen。'
images: []
authors: ['default']
layout: PostLayout
---

## 前言

前段时间掘金上线了一个新功能 Code pen，可以在线写代码，浏览器就可以运行预览，在文章中就可以插入代码片段，对 web 开发者大有裨益，非常方便读者对文章的理解，笔者对这种在线实时编辑的功能充满了好奇，所以打算开发一个简易的 Code pen。

## 技术栈

- Next.js
- Tailwindcss
- Uniapp 云数据库

## 初始化项目

使用以下命令初始化一个 next 项目

```bash
npx create-next-app next-code-pen
cd next-code-pen
```

安装 `tailwindcss` 相关包，初始化 `tailwind.config.js`

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

修改 `tailwind.config.js` 配置，将代码移动到`src`目录下，这个是我的个人偏好

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 页面结构

用 Tailwind 来实现一个页面

### SVG 实现 LOGO

有个好的 logo 才可以开始一个好的项目

```html
<div className="flex justify-center items-center h-16 w-28">
  <svg
    className="w-10 h-10"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M512 341.33333336c0-94.4 76.8-171.2 171.2-171.2 94.4 0 171.2 76.8 171.2 171.2s-76.8 171.2-171.2 171.2C588.8 512.53333336 512 435.73333336 512 341.33333336z"
      fill="#FF3C41"
    ></path>
    <path
      d="M171.2 682.13333336c0-94.4 76.8-171.2 171.2-171.2H512v171.2C512 776.53333336 435.2 853.33333336 340.8 853.33333336s-169.6-76.8-169.6-171.2z"
      fill="#0EBEFF"
    ></path>
    <path
      d="M171.2 341.33333336c0 94.4 76.8 171.2 171.2 171.2H512V170.13333336H340.8c-94.4 0-169.6 76.8-169.6 171.2z"
      fill="#FCD000"
    ></path>
    <text fill="#fff" x="520" y="860" fontFamily="Verdana" fontSize="460">+</text>
  </svg>
  <span className="ml2 text-gray-50">CODE</span>
</div>
```

效果

![logo](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/500e9470b0b2493590e752fd5f363637~tplv-k3u1fbpfcp-zoom-1.image)

这个 logo 部分来源`figma`，后面再加一个`+`，意味着后我们可以从它开始一些五彩斑斓的项目。

### 页面主体部分

我们先安装 `react-split-pane`, 把我们的页面拆分成几块，分为 HTML，CSS，JS，可以拖拽视窗大小，这个包依赖版本是 react16， 由于 react 是平滑升级，所以可以强制安装

```bash
npm i react-split-pane --force
```

使用 react-split-pane ，初始化页面结构, react-split-pane 是将页面拆分成 2 块，若要拆分成 3 块的话，要使用 2 次。

```html
<SplitPane defaultSize="50%" split="vertical">
  <SplitPane split="horizontal" defaultSize="33%">
    <div className="overflow-hidden flex flex-col w-full"></div>
    <SplitPane split="horizontal" defaultSize="50%">
      <div className="overflow-hidden flex flex-col  h-full w-full"></div>
      <div className="overflow-hidden flex flex-col h-full w-full"></div>
    </SplitPane>
  </SplitPane>
  <div className="bg-red-50 h-full overflow-hidden"></div>
</SplitPane>
```

## 效果

![拖拽效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95f4555de5cf40719eeb772fdf1740cb~tplv-k3u1fbpfcp-watermark.image?)

预览地址：https://code.runjs.cool/pen/create

代码仓库：https://github.com/maqi1520/next-code-pen

至此项目初始化成功， 接下来将介绍 在 next 项目中使用 Monaco Editor，Monaco Editor 是 VS Code 中使用的开源代码编辑器， 拥有代码高亮和代码自动补全的功能。

若对你有帮助记得点个 star，感谢！

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
