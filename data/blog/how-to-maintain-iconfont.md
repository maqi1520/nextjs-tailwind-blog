---
title: 'Iconfont 还是不能上传，如何维护你的 Icon？'
date: '2022/7/22'
lastmod: '2022/7/22'
tags: [JavaScript, React.js]
draft: false
summary: '大多情况下，我们不必上传自己的图标，只需要在 iconfont.cn 便捷的搜索，就可以将图标加入到自己的项目图标库中，但最近工作中却遇到了比较严重的问题。'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f176aaf6430a4bfa93de8782b7de03f7~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

使用 iconfont 有很多优势，比如只需要加载一次，全部图标都可以设置字号大小，颜色、透明度等，可以随意变换字体的形态，并且图标是矢量的，不会随着字体大小的变化失真，得益于 [iconfont.cn](https://www.iconfont.cn/ 'iconfont.cn') 提供的便利，大多情况下，我们不必上传自己的图标，只需要便捷的搜索，就可以将图标加入到自己的项目图标库中，但最近工作中却遇到了比较严重的问题。

## 现在做的事情

我所在公司目前正在建设低代码平台，这个低代码平台可以说是无代码，需要从原先的各个应用中抽取部分页面和组件成为低代码组件，这样低代码平台就可以通过拖拽组件，形成一个有个性化的业务场景。如果 A 应用中的 A 组件需要更新，那么低代码中的组件也需要同步更新，所以说组件并不是单独的一个 npm 包，而是类似于 webpack5 模块联邦（Module Federation）打包出来的 remote（远程）组件。

## 遇到的问题

### 问题一：命名冲突

![图标命名冲突](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aeac8b45729f4540b1c57a6f9f768ded~tplv-k3u1fbpfcp-zoom-1.image)

原先都是一个个独立的应用，都是可以独立部署独立运行，现在需要将这些应用组合在一起，形成一个新的应用，就遇到这个关于图标的问题。

由于原先各个应用都是独立部署，所以项目中就直接引用了 [iconfont](https://www.iconfont.cn/) 中的字体，命名也都叫 iconfont，一旦将这些组件组合到一起，命名冲突之外，字体中的 unicode 也会冲突。

### 问题二：icon 图标库没交接

由于 icon 图标库都是各个应用的前端开发者维护的，他们都在自己的用户名下建立项目， iconfont 图标库在 git 仓库之外，在人员变动的情况下，图标库的权限往往会忘记交接。

## 问题三： iconfont 维护

![iconfont 维护](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13b1b5b10d37486bb85348bd60513d24~tplv-k3u1fbpfcp-zoom-1.image)

正巧遇到 iconfont 维护，到目前为止虽然可以使用，但是想要上传新的图标还是不行。

## 如何解决？

### 问题一：全局替换

最简单的方式是各个应用全局替换加前缀。

```html
- <span class="iconfont icon-xxx"></span> + <span class="appAiconfont appAicon-xxx"></span>
```

这样做当然没问题，但是到低代码平台那边就会加载 n 个字体文件，并且都是包含整个应用的字体，这就失去了使用 iconfont 的优势。

### 问题二：要回权限

虽然我们可以要回离职人员 iconfont 中项目的权限，短期可以解决项目上图标使用的问题，但是这个问题还是会有存在的可能。

### 问题三：力所不及

iconfont 目前也遇到了较大的问题，到目前为止还无法上传文件，对于我们这些 iconfont 的使用者来说只有等待。

## 最终方案：使用 svg 代替 iconfont

使用 svg 的优势

- 完全离线化使用，不需要从 CDN 下载字体文件，图标不会因为网络问题呈现方块，也无需字体文件本地部署。

- 没有 unicode，不会因为抽离组件而造成图标冲突

- 在低端设备上 SVG 有更好的清晰度。

- 支持多色图标。

- svg 可以支持动画

目前流行的组件库已经都使用了 svg 代理字体图标，比如 ant-design、Material-UI 等

## 将引用的 iconfont 转变为本地 svg

我们可以手动一个一个从 iconfont 图标库中下载 svg，但这样做未免有些过于麻烦。
![iconfont css](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/479908fb3be24780bccfce1de0eb984f~tplv-k3u1fbpfcp-zoom-1.image)
在 iconfont 字体样式中，css 包含了这样一个路径，或者我们可以在项目 css 中直接找到这段代码，然后下载这个 svg。
打开 svg 会看到如下代码
![iconfont.svg 代码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0391f68e6b124076a05dc4fcf0e99260~tplv-k3u1fbpfcp-zoom-1.image)
一个 `glyph` 元素定义了 SVG 字体中的一个独立的字形，所以我们可以通过一个 node 脚本将这里面的独立字形转变 svg

**直接上代码**

```js
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

fs.readFile(path.join(__dirname, './iconfont.svg'), 'utf8', function (err, data) {
  if (err) throw err
  //console.log(data)
  const $ = cheerio.load(data)
  $('glyph').each((index, item) => {
    const svgStr = `<svg  fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <path d="${item.attribs.d}"></path>
</svg>`
    fs.writeFile(
      path.join(__dirname, `./svg/${item.attribs['glyph-name']}.svg`),
      svgStr,
      (err, data) => {
        if (err) throw err
      }
    )
  })
})
```

[cheerio](https://cheerio.js.org/ 'cheerio') 是一个 nodejs 下类似 jquery api，
主要是利用 cheerio 将字符串中的 `d `和 `glyph-name` 写到一个 svg 文件中。
iconfont 中的字体图标大家都是 1024 所以，设置`viewBox="0 0 1024 1024"`。

**看下效果**

![svg 转化完成](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/002740c77d494e4894d38e54d682eb48~tplv-k3u1fbpfcp-zoom-1.image)

这下，可以不用问离职人员要 iconfont 权限了。

## svg 转为 React Component

在 webpack 中我们可以使用一个 叫 `svgr` 的 loader，它可以将 SVG 转换为一个随时可用的 React 组件。

首先使用 npm 安装 `@svgr/webpack`

```bash
npm install @svgr/webpack --save-dev
```

然后在 `webpack.config.js` 中加入配置

```js
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
    ],
  },
}
```

使用方式

```jsx
import svg from './assets/file.svg?url'
import Svg from './assets/file.svg'

const App = () => {
  return (
    <div>
      <img src={svg} width="200" height="200" />
      <Svg width="200" height="200" viewBox="0 0 3500 3500" />
    </div>
  )
}
```

通过使用 `?url` 区分是否使用 url 的方式引用。

svgr 官网可以的 [palayround](https://react-svgr.com/playground/ 'svgr palayround') 可以实时预览转换后的代码

![svgr palayround](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c68f4308472348e88f74ed7b705c0af8~tplv-k3u1fbpfcp-zoom-1.image)

我们只需要启动应用程序，Webpack 就会自动完成转换任务，再不需要再担心 SVG 了。你可以将 SVG 文件放在 `src/`文件夹中的任何位置，并将它们作为 React 组件导入使用。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
