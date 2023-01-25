---
title: 创建 React 应用的 7 种方式，你用过几种？
date: 2022/12/6 23:56:54
lastmod: 2023/1/25 11:42:13
tags: [React.js, 掘金·金石计划]
draft: false
summary: 本文例举创建 react 应用的常见 7 种方式，首先，我们第一个是想到的是 react 官方团队提供的脚手架工具 Create React App(cra) 项目是零配置。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f2429d85e694e2c83e047daf1b6f3c0~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 一：Create-React-App

首先，我们第一个是想到的是 react 官方团队提供的脚手架工具 [Create React App](https://create-react-app.dev/)(cra)

```bash
npx create-react-app my-app
cd my-app
npm start
```

还可以选择 typescript 模板

```bash
npx create-react-app my-app --template typescript
```

项目是零配置的，在 `package.json` 中，我们可以看到以下几个命令，Create React App 将构建代码封装在 [react-scripts](https://www.npmjs.com/package/react-scripts) 中。

```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
```

有时候，我们需要修改脚手架的默认配置，比如：我们想要修改入口模式为多入口（webpack entry）， 或者让 Create React App 支持 less ，此时 react-scripts 的默认配置就无能为力了。

### eject 弹出配置

我们可以在命令行运行 `eject` 命令

```
npm run eject
```

将所有配置弹出，弹出后所有的依赖，比如 Webpack, Babel, ESLint 等，都会在 `package.json` 中安装， 然后就可以在 `config/webpack.config.js` 修改 webpack 相关配置了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b2529a6530e4cd1b1652bedfdd48ab8~tplv-k3u1fbpfcp-zoom-1.image)

也可以在 `package.json` 中修改 babel、jest、eslint 等相关配置。

```
"eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "babel": {
    "presets": [
      "react-app"
    ]
  }
```

如果说，你只想修改 `config/webpack.config.js` 中的配置，那么 `package.json` 中的代码，会变得非常冗长，单 jest 配置代码就超过 1 屏。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34d799e75dc34e36a08c34cc4e97a198~tplv-k3u1fbpfcp-zoom-1.image)

因此社区中提供了一些可配置的 cra 方案，[craco](https://craco.js.org/)、[react-app-rewired](https://www.npmjs.com/package/react-app-rewired)

### craco 可配置的 cra

这里以 craco 为例，首先需要安装 `@craco/craco`

```
yarn add @craco/craco
```

我们只需要将 `react-script` 替换为 `craco`

```
/* package.json */
"scripts": {
-   "start": "react-scripts start",
-   "build": "react-scripts build",
-   "test": "react-scripts test",
+   "start": "craco start",
+   "build": "craco build",
+   "test": "craco test",
}
```

然后在项目根目录创建一个 `craco.config.js` 用于修改默认配置。

```js
/* craco.config.js */
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.entry = {
        index: './src/index.js',
        other: './path/to/my/entry/file.js',
      }
      return webpackConfig
    },
  },
}
```

上面代码就是修改 webpack 为多入口， [craco](https://craco.js.org/) 的官网也非常清晰，还提供了 [plugin](https://craco.js.org/plugins/) 模式，若你想覆盖 cra 的配置，可以先在 plugins 里面找找，比如上面提到的，让项目支持 less，就可以直接使用 [craco-less](https://github.com/DocSpring/craco-less) 这个插件。

如果说对于上面的配置你不知所措，我想你有必要了解下，如何从零创建一个 webpack react 工程，这将帮你修改 webpack 工程更加得心应手。

## 二：从零创建 webapck react 工程

### 初始化项目

首先使用 npm init 创建一个前端项目

```bash
mkdir my-app
cd my-app
npm init -y
```

### 安装 webpack

```bash
npm i -D webpack webpack-cli webpack-dev-server html-webpack-plugin
```

- webpack - 前端构建工具
- webpack-cli - 让 webpack 支持命令行执行
- webpack-dev-server - 开发模式下启动服务器，修改代码，浏览器会自动刷新。

安装到 `devDependencies` 中，因为这些只是构建工具

### 安装 babel

```bash
npm i -D @babel/core @babel/preset-env @babel/preset-react babel-loader
```

- babel： 可以将 es6 代码转变为 es5，
- @babel/preset-react： 让 babel 支持 react 的预设
- babel-loader：是让 webpack 支持 babel 的加载器

在项目更目录新建一个 `babel.config.js` 文件，将安装的 babel 写入这个文件，babel 会在运行前读取这份配置文件。

```js
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
}
```

### 安装 CSS 加载器

webpack 默认不会处理 css 文件，为了让项目能够支持 css，我们需要安装 `style-loader`和`css-loader`。

```bash
npm i -D style-loader css-loader
```

css-loader 用于解析 css 文件；
style-loader 会通过使用多个 `<style></style>`标签的形式自动把 styles 插入到 DOM 中。

### 安装 react 和 react-dom

```
npm i react react-dom
```

安装到 `dependencies` 中，因为`react`和`react-dom` 是运行时的依赖项

### 建一个 `index.html` 文件

创建一个在`public`目录，并且在下面新建一个`index.html` 文件。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Application</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 新建一个 index.js 文件

创建一个名为 `src` 的文件夹，所有源代码都放在该目录下，在`src`目录下，创建`index.js`文件，该文件也就是 webpack 构建的入口文件

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### 创建 `App` 组件

新建一个 `App.js` 文件

```jsx
// ./src/App.js
import React from 'react'
import './App.css'
const App = () => {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  )
}
export default App
```

新建一个 `App.css` 文件

```css
// ./src/App.css
h1 {
  color: red;
}
```

### 创建 webpack config 文件

在项目根目录创建一个 `webpack.config.js` 文件，`webpack.config.js` 是 webpack 的默认配置文件名

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
    clean: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}
```

### 更新 `package.json` 文件

```json
"start": "webpack-dev-server --mode development --hot --open",
"build": "webpack --mode production"
```

webpack 有 2 种模式，分别是 `development` 和 `production`，告知 webpack 使用相应模式的内置优化， 可以从 CLI 参数中传递。 `-hot` 参数允许代码热更新（代码改动，浏览器会自动更新），`-open`参数允许 Webpack 帮我们自动打开浏览器窗口。

运行 `npm run start` 启动脚本时， React 应用程序应该在端口 `8080` 上运行，此时我们可以在本地开发 react 应用了

### 配置 proxy 代理

开发时，需要请求接口，而接口往往是由后端同学完成的，接口需要通过访问后端的 IP 地址来访问，若直接访问会存在跨域问题。

那么我们可以在 `webpack.config.js` 中配置 proxy。

```js
module.exports = {
  //...
  devServer: {
    proxy: [
      {
        context: ['/auth', '/api'],
        target: 'http://localhost:3000',
      },
    ],
  },
}
```

现在，对 `/api/users` 的请求会将请求代理到 `http://localhost:3000/api/users` 上。

## 三：Vite

如果你的项目代码量比较大，或者你厌恶了 webpack 的打包速度，那么你可以选择使用 [vite](https://cn.vitejs.dev/) 来创建你的 React 应用。

vite 采用浏览器支持 ES 模块来解决开发时构建缓慢的问题，使用 esbuild 预构建依赖（开发时不会变动的纯 JavaScript 代码，一般是 node_modules 中的第三方包）。

vite 不但支持 vue 还支持 react、preact、svelte 等框架和原生 js。

### 使用 create-vite 创建应用

使用 vite 创建项目也非常简单

```
npm create vite@latest
```

我们可以在命令行中选择需要使用的的框架

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e10af9d2ce25410b827f983ff3888664~tplv-k3u1fbpfcp-zoom-1.image)

选择使用 JavaScript 还是 typescript 开发

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e056555910446ab9f3bec1027d073b0~tplv-k3u1fbpfcp-zoom-1.image)

使用 `npm run dev` 启动，开发端口启动在 `http://127.0.0.1:5173/`

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3de5638a87f94a13815117d8c0b21914~tplv-k3u1fbpfcp-zoom-1.image)

vite 的启动速度和热更新速度都很快，远超过 webpack，新项目完全可以使用 vite 来代替 cra。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e36679ceb15e48af87e96d844bf87bae~tplv-k3u1fbpfcp-zoom-1.image)

老项目迁移会存在一定成本，可以参考我之前的文章[《将 React 应用迁移至 Vite》](https://juejin.cn/post/7110535158863757319)

## 四：Gatsby

Gatsby 不仅仅是一个静态网站生成器，它更是一个渐进式 Web 应用生成器。通过 Gatsby 建立的网站，很容易被搜索引擎检索到，而且页面的渲染性能非常好，完美支持个人网站、博客、文档网站，甚至是电子商务网站。

### 创建 gatsby 应用

```
npm init gatsby
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba0c8ad68da8458f86b5d297a1768b20~tplv-k3u1fbpfcp-zoom-1.image)

在命令行中选择开发语言，是否使用 CMS、是否支持、md、mdx 等

创建完成后，在命令行运行 `npm run dev`，打开 `http://localhost:8000/` 看下效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/221d5ce49b3540f89288e179266f8273~tplv-k3u1fbpfcp-zoom-1.image)

打开 `http://localhost:8000/___graphql` 运行 graphql 语言查询

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a3ffaa41ed61414dbdb485081da89873~tplv-k3u1fbpfcp-zoom-1.image)

比如创建一个博客列表，可以在代码中直接导出一个 graphql 查询语言，然后在函数中使用查询的数据进行渲染。

```jsx
import * as React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import Seo from '../components/seo'

const BlogPage = ({ data }) => {
  return (
    <Layout pageTitle="My Blog Posts">
      <ul>
        {data.allFile.nodes.map((node) => (
          <li key={node.name}>{node.name}</li>
        ))}
      </ul>
    </Layout>
  )
}

export const query = graphql`
  query {
    allFile {
      nodes {
        name
      }
    }
  }
`

export const Head = () => <Seo title="My Blog Posts" />

export default BlogPage
```

Gatsby 的优势：

- ✅ 页面渲染性能优秀
- ✅ 对 SEO 友好
- ✅ 对打包文件进行了优化
- ✅ 轻松部署到 CDN（基于出色的扩展功能）
- ✅ 丰富的插件系统

Gatsby 的劣势：

- ⛔️ 使用起来相较于 CRA 更为复杂
- ⛔️ 需要了解 GraphQL 和 Node.Js 的相关知识
- ⛔️ 配置繁重
- ⛔️ 构建时间会随着内容的增加而变长
- ⛔️ 云服务需要付费

值得强调的是，丰富的插件系统是选择 Gatsby 的重要原因，比如 Gatsby 提供许多博客主题插件，其他例如谷歌分析、图片压缩、预加载插件等等。

## 五：Next.js

Next.js 是一个基于 React 的服务端渲染框架，它提供了约定式路由、多种渲染方式、静态导出等功能。

**渲染方式**

- CSR - 客户端渲染。也就是我们常说的 SPA（single page application），使用 `useEffect` 获取接口数据。
- SSR - 服务器端渲染
- SSG - 静态站点生成。
- ISR – 增量静态再生，可以再次从 API 获取数据，并且生成静态页面，最适合常见的资讯类、新闻类网站。
- Server component- 也是 SSR 的一种， 但互补了 SSR 的不足，让网页拥有流式渲染的能力。

### 创建 Next.js 应用

```bash
npx create-next-app@latest --ts
```

在项目中，您可以编写 react 组件，并使用 Next.js 提供的 API 进行路由配置、服务端渲染等操作。例如，您可以在 pages 目录下创建一个 index.js 文件，用于编写组件：

```
import React from 'react';

function Home() {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
    </div>
  );
}

export default Home;
```

这样，您就可以在项目中使用 Next.js 实现服务端渲染和组件开发了。更多关于 Next.js 的用法，请参考[官方文档](https://nextjs.org/)，也可以参考我的 [《Next.js 全栈开发实战》](https://juejin.cn/column/7140121965360054308) 专栏

优点：

- 提供了服务端渲染，可以提升首屏加载速度。例如，在 Next.js 中，可以使用 `getServerSideProps` 方法获取数据，并在服务端渲染页面，提升首屏加载速度。
- 支持静态导出，可以提升 SEO。例如，在 Next.js 中，可以使用 `next export` 命令，将项目打包为静态文件，并发布到 CDN 上，让搜索引擎更容易抓取页面。
- 提供了代码拆分、路由约定等优化方案，可以提升应用的加载速度和运行效率。例如，在 Next.js 中，可以使用 `dynamic` 导入组件，实现代码拆分；
- 可以使用 `next/link` 组件，实现客户端路由跳转，提升用户体验等。

## 六：UmiJS

Umi 作为一个可扩展的企业级前端应用框架，在蚂蚁集团内部已经已直接或间接地服务了 10000+ 应用，它提供了路由、状态管理、插件体系等功能。

### 创建 umi 应用

如果要快速上手 umijs，可以使用它提供的脚手架工具 create-umi

```
npx create-umi@latest
```

在创建过程中，会提示选择模板，选择「Simple App」模板即可。创建完成后，进入项目目录，安装依赖：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb557a93a3a84f9087efb50a74a145f4~tplv-k3u1fbpfcp-watermark.image?)

也可以选择 ant design pro 模板和 vue 模板，选择完成后会自动安装依赖。

最后，启动项目：

```
cd my-project
npm start
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e777cf7ce7b4383a3113c59f78b2185~tplv-k3u1fbpfcp-watermark.image?)

这样，您的第一个 umijs 项目就创建完成了，可以在浏览器中访问 http://localhost:8000 查看效果。

![未命名4.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1adf169c658249a39209cf71beb111e2~tplv-k3u1fbpfcp-watermark.image?)

在项目中，您可以编写 react 组件，例如，您可以在 `src/pages` 目录下创建一个 Home.js 文件.

```js
import React from 'react'

function Home() {
  return (
    <div>
      <h1>Hello, umijs!</h1>
    </div>
  )
}

export default Home
```

创建完成后就可以直接生成路由，访问 `http://localhost:8000/home`页面。这样，您就可以在项目中使用 umijs 实现路由配置和组件开发了。更多关于 umijs 的用法，请参考它的[文档](https://umijs.org/zh/guide/)

**优点：**

- 提供了丰富的插件，可以快速搭建应用。例如，[Qiankun 微前端插件](https://umijs.org/docs/max/micro-frontend)， 插件可以帮助开发者快速创建微前端应用；[dva 插件](https://umijs.org/docs/max/dva)可以帮助开发者解决状态管理；[国际化插件](https://umijs.org/docs/max/i18n)可以帮助开发者实现多语言支持等。
- 支持路由约定，可以让开发者专注于业务逻辑。例如，在 umijs 中，`/src/pages` 目录下的文件会自动生成路由，无需手动配置。
- 提供了按需加载、代码拆分等优化方案，可以提升应用的加载速度和运行效率。

## 七：在线开发

或许你疲倦了 cli 创建 react 应用的方式，因为有时候，只想演示一个简单应用示例，那么 https://stackblitz.com/ 和 https://codesandbox.io/ 这 2 个网站可以快速你创建应用。

若以上两个网站访问速度较慢，那么掘金的[码上掘金](https://code.juejin.cn/ '码上掘金')也可以帮助你创建在线 React 示例应用。

### 以 StackBlitz 为例

StackBlitz 是一个在线的开发环境，它可以帮助开发者快速创建、运行和分享前端项目, 并且支持协作开发。

StackBlitz 支持多种前端框架，如 React、Angular、Vue、Next.js、Nodejs 等，并提供了自动构建、热更新、代码预览等功能。

例如创建一个 React 项目：

1.  打开 StackBlitz 网站，并点击右上角的新建按钮。
1.  在弹出的新建项目对话框中，选择 React 模板，并输入项目名称，点击确定按钮。
1.  StackBlitz 会自动创建一个新的 React 项目，并打开编辑器界面。
1.  在编辑器中，可以编辑代码，并预览效果。
1.  在编辑器中，也可以管理项目的文件，并保存项目的修改。

使用 StackBlitz，开发者无需安装任何软件，即可在线创建、编辑和分享项目，方便快捷。

![StackBlitz](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87ce40aa84f7478e8482371d49164b32~tplv-k3u1fbpfcp-watermark.image?)

StackBlitz 中的 React 项目也是使用了 `react-scripts` 只不过是把 Node 运行在浏览器里面，感兴趣的同学可以看下 [WebContainer 介绍](https://blog.stackblitz.com/posts/introducing-webcontainers/ 'WebContainer 介绍')

## 小结

我们可以轻松使用 cli 来创建前端应用， 这样开发者可以更加专注业务开发，
以上便是创建 react 应用的常见 7 种方式，当然还有其他方案，无论使用哪种方式创建 React 项目，都需要了解 Node.js 和底层技术的使用，并且需要了解 React 的基本概念，才能正确使用，您使用哪种方式呢？欢迎在评论区留言。

> 本文正在参加[「金石计划 . 瓜分 6 万现金大奖」](https://juejin.cn/post/7162096952883019783 'https://juejin.cn/post/7162096952883019783')
