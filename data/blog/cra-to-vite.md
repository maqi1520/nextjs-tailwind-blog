---
title: '将 React 应用迁移至 Vite'
date: '2022/6/25'
lastmod: '2022/6/25'
tags: [React.js, Vite]
draft: false
summary: 'Vite 充分利用了浏览器的加载机制和缓存机制等，大大提示了研发效率，vite 虽然快，但不是所有的项目react 项目都可以迁移成功'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32e60817bbb543069ceddb0c99062d39~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

当下，在项目开发的过程中，对于大多数人来说，会使用 create react app 来创建 react 应用，它开箱即用，零配置，但随着项目中代码量的增加，你的项目构建时间也会随之增加，开发服务启动时间变得缓慢，代码更改后热更新也会变慢，可能会需要 2-5s 才会在页面上体现，那么能否提高构建速度，减少开发者等待的时间呢？

## 如何提升构建速度？

我们可以将构建工具迁移到 [Vite](https://vitejs.dev/ 'https://vitejs.dev/')。

Vite 是下一代前端构建工具，可以更快地构建应用程序。

## Vite 的亮点

- 极速的服务启动，使用原生 ESM 文件，无需打包!
- 轻量快速的热重载，无论应用程序大小如何，都始终极快的模块热重载（HMR）
- 开箱即用，对 TypeScript、JSX、CSS 等支持开箱即用。
- Rollup 构建，可选 “多页应用” 或 “库” 模式的预配置
- 通用的插件，在开发和构建之间共享 Rollup-superset 插件接口。
- 灵活的 API 和完整的 TypeScript 类型。
- 支持 React, [Vue](https://vite.new/vue 'https://vite.new/vue'), [Preact](https://vite.new/preact 'https://vite.new/preact'), [Svelte](https://vite.new/svelte 'https://vite.new/svelte').

## 创建 vite 新项目

使用以下命令创建全新的 react 应用程序。

```bash
yarn create vite my-react-app --template react
```

## CRA 为什么慢？

Create react app 使用 wabpack 来打包。

![webpack 打包图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e581027c1ee3498db6f9c43fd8ab8a42~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 如上图所示，它将整个项目的代码打包在一起，然后才能启动服务。

## Vite 为什么快？

Vite 将会使用 [esbuild](https://esbuild.github.io/ 'https://esbuild.github.io/') [预构建依赖](https://cn.vitejs.dev/guide/dep-pre-bundling.html 'https://cn.vitejs.dev/guide/dep-pre-bundling.html')。esbuild 使用 Go 编写，并且相比 JavaScript 编写的 babel 打包器预构建依赖快 10-100 倍。

## 依赖预构建

当你首次启动 `vite` 时，你可能会注意到打印出了以下信息：

```bash
Pre-bundling dependencies: （正在预构建依赖：）
  react,
  react-dom
(this will be run only when your dependencies or config have changed)（这将只会在你的依赖或配置发生变化时执行）
```

**依赖预构建的目的:**

1.  Vite 必须先将作为 CommonJS 或 UMD 发布的依赖项转换为 ESM。
2.  **性能：** Vite 将有许多内部模块的 ESM 依赖关系转换为单个模块，例如，[`lodash-es` 有超过 600 个内置模块](https://unpkg.com/browse/lodash-es/ 'https://unpkg.com/browse/lodash-es/')！通过预构建 `lodash-es` 成为一个模块，我们就只需要一个 HTTP 请求了！

## 按需加载

Vite 通过在一开始将应用中代码区分为 **依赖** 和 **源码** 两类，改进了开发服务器启动时间。

- **依赖** 一般是那种在开发中不会改变的 JavaScript，比如组件库，或者一些较大的依赖（可能有上百个模块的库），这一部分使用 esbuild 来进行预构建依赖
- **源码** 是我们开发的 JSX，CSS 或者 Vue/Svelte 组件，需要编译后才可以执行。同时，并不是所有的源码都需要同时被加载（例如基于路由拆分的代码模块）。 ![vite 打包图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ccaec56dc33441391de7cf01ad573cc~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

如上图所示，当浏览器请求时，Vite 只需要按需编译当前屏幕使用的代码。

## 缓存优化

Vite 是直接把转换后的 ES module 的 JavaScript 代码，给支持 ES module 的浏览器，让浏览器自己去加载依赖，也就是把压力丢给了浏览器，从而达到了项目启动速度快的效果。 在我们修改其中一个代码模块的时候，Vite 热更新非常快，源码中模块的请求会根据 `304 Not Modified` 进行协商缓存，而依赖模块请求则会通过 `Cache-Control: max-age=31536000,immutable` 进行强缓存，因此一旦被缓存它们将不需要再次请求。

## 时间对比

我拿一个 create react app 项目， 该项目包含 3 个路由页面，14 个组件，迁移到 vite，也就是大家常说的 cra 来测试过，我们一起来对比下时间:

![开发模式](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f87eb865bffc4a91bbe6684199d90197~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) CRA 12 s，vite 298 ms。 Vite 开发环境是懒编译模式， 298ms 只是启动 devServer 的时间，不包含资源编译，只有你用浏览器去请求页面了，它才会进行编译，但是 CRA 是一次性把所有资源都编译、打包了

![打包模式](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1bb088f5fce9480f8bc018fd939de9a3~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) CRA 15.66 s，vite 9.11 s

## 从 CRA 迁移到 Vite

那么我是如何从老项目迁移到 vite 的呢？

- 首先从 **package.json** 删除依赖 `react-scripts`.
- 在 `dependencies` 安装以下依赖

```json
"devDependencies": {
  "@vitejs/plugin-react": "1.1.1",
  "vite": "2.7.0"
},
```

- 修改 package.json 中 scripts 命令

```json
"scripts": {
  // 开发阶段启动 Vite Dev Server
  "dev": "vite",
  // 生产环境打包
  "build": "tsc && vite build",
  // 生产环境打包完预览产物
  "preview": "vite preview"
},
```

- 创建一个 **vite.config.js 输入以下代码**

```jsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  return defineConfig({
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
    },
  })
}
```

可以看到配置文件中默认在 plugins 数组中配置了官方的 react 插件，来提供 React 项目编译和热更新的功能。

- 配置别名

  如果你的项目中使用到了别名，则需要做出相应修改。

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const { resolve } = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src', 'components'),
      '@utils': resolve(__dirname, 'src', 'utils'),
      '@config': resolve(__dirname, 'src', 'config'),
    },
  },
  plugins: [react()],
})
```

- 将 **index.html 移动到 public 文件夹外面**
- 在 index.html 删除 `%PUBLIC_URL%`

```html
//修改前
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
//修改后
<link rel="icon" href="/favicon.ico" />
```

- 在 **index.html 引入入口 js 脚本**

```html
<div id="root"></div>
<script type="module" src="/src/index.jsx"></script>
```

- 修改 **REACT_APP 开头的 env 环境变量**

`REACT_APP_XXX`  的环境变量，则切换为  `VITE_XXX`，假如有一个  `.env`  文件：

```bash
// 修改前
REACT_APP_ENV = local
// 修改后
VITE_ENV = local
```

- SASS

如果项目使用了 sass，则需要执行命令进行安装：

```auto
$ yarn add -D sass
```

如果 scss 文件里面引入了一些 node_modules 的 css 是使用 `~` 符号的，可以做出调整：

```auto
@import '~antd/dist/antd.css';

调整为

@import 'antd/dist/antd.css';
```

可以参考 [issue - Cannot import CSS from node_modules using "~" pattern](https://github.com/vitejs/vite/issues/382 'https://github.com/vitejs/vite/issues/382')

- 重新执行 yarn 命令，安装依赖
- 执行 `yarn start` 启动

若能够成功启动，那么恭喜你，项目迁移成功了，若不能启动，我们可以根据命令行中的提示，参照 [Vite](https://cn.vitejs.dev/guide/dep-pre-bundling.html 'https://cn.vitejs.dev/guide/dep-pre-bundling.html') 文档修改。

## 遇到问题

### decorators not support

项目代码中如果使用了装饰器，比如 redux 提供的 connect 来绑定状态，形如：

```js
@connect(state =&gt; state.foo)
class Foo extends React.PureComponent {
	....
}
```

但是 decorators 语法居然不被 vite 支持，关于这个问题，也有一个[issus](https://github.com/vitejs/vite/issues/2349 'https://github.com/vitejs/vite/issues/2349')，目前没有一个好的解决办法，只好去掉 decorators，改用常规的函数绑定了。

### 无法按需加载样式文件

如果项目组使用了 antd 组件库，本来会使用 babel-plugin-import 来自动导入组件和样式， vite 对 babel-plugin-import 支持不那么好，那么就要手动修改代码。

```js
// 修改前
import { Button } from 'antd'

// 修改后
import Button from 'antd/lib/button'
import 'antd/lib/button/style/index.css'
```

也可以使用 [vite-plugin-imp](https://www.npmjs.com/package/vite-plugin-imp 'https://www.npmjs.com/package/vite-plugin-imp')

### 'default' is not exported

有时候三方依赖项加载会出错，例如'default' is not exported 等，这里可以参考 [issues](https://github.com/vitejs/vite/issues/2679 'https://github.com/vitejs/vite/issues/2679')

在实际迁移过程中，还是难免遇到一些奇怪的问题，这都是尝鲜的代价。

## 小结

Vite 充分利用了浏览器的加载机制和缓存机制等，大大提示了研发效率，vite 虽然快，但不是所有的项目 react 项目都可以迁移成功，若有些项目的中的 npm 包并不遵循 CommonJS 的规范，那就可能迁移失败，或者需要写一些自定义插件来适配，所以笔者认为不要激进地直接重构一些已有的大型项目，打包不是目的，运行才是，若有些项目 webpack 配置特别复杂，那么我们可以升级到 webpack5，或者[开启 webpack5 懒编译模式](https://juejin.cn/post/7090372816784064526 'https://juejin.cn/post/7090372816784064526')等， 这样既能提升部分构建效率，也可以保证项目能够稳定运行。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
