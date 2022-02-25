---
title: '使用 esbuild 来打包一个 React 库'
date: '2022/1/9'
lastmod: '2022/1/10'
tags: [前端, React.js]
draft: false
summary: 'esbuild 是一个非常快的 Javascript 打包工具，本文结合 react 对 esbuid 这个打包工具进行了简单使用。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5804e145bc743c99a001e52b70a259e~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

[esbuild](https://esbuild.github.io/) 的大名相信大家也有耳闻，它是一个非常快的 Javascript 打包工具，用 GO 语言编写，是 figma 的 cto [Evan Wallace](https://twitter.com/evanwallace) 著作的，一个 30 min 的 webpack 项目用 esbuild 可以分钟级运行。本文将记录使用 esbuild 来打包一个 React 库。

## 需求

这里我打算开发一个 react-checkbox 为例

```jsx
<input type="checkbox" checked={true}/>
<input type="checkbox" checked={false}/>
```

因为 checkbox 只有两种值：选中（checked）或未选中（unchecked），在视觉上 checkbox 有三种状态：`checked`、`unchecked`、`indeterminate`（不确定的），在实现全选效果时，你可能会用到  `indeterminate`  属性, 对于`indeterminate` 这个状态**无法在 HTML 中设置 checkbox 的状态为 indeterminate**。因为 HTML 中没有`indeterminate`这个属性，你可以通过 Javascript 脚本来设置

```js
const checkbox = document.getElementById('checkbox')
checkbox.indeterminate = true
```

效果如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68cd381e6c4b4f53b37dfd314e41beed~tplv-k3u1fbpfcp-watermark.image?)

所以我们的需求是需要给 checkbox 增加一个 indeterminate 属性

## 项目初始化

首先我们来创建一个文件夹并且初始化 npm.

```shell
mkdir react-checkbox && cd react-checkbox && npm init --yes
```

我们使用 typescript，当然也要安装 react 和 react-dom

```shell
npm i esbuild typescript @types/react @types/react-dom --save-dev
```

然后我们在根目录下创建文件 `./tsconfig.json`

```json
{
  "compilerOptions": {
    "outDir": "./lib",
    "target": "es6",
    "module": "commonjs",
    "noImplicitAny": true,
    "strictNullChecks": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "typeRoots": ["node_modules/@types"]
  },
  "include": ["./src/**/*.tsx", "./src/**/*.ts", "example/index.tsx"],
  "exclude": ["node_modules"]
}
```

## 代码实现

接下来我们创建 `src/checkbox.tsx`,下面是实现代码

```tsx
import { ReactElement, CSSProperties, ChangeEvent } from 'react'

export interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  className?: string
  style?: CSSProperties
  disabled?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

const Checkbox = ({
  checked = false,
  indeterminate = false,
  className = '',
  style = {},
  disabled = false,
  onChange,
}: CheckboxProps): ReactElement => {
  return (
    <input
      type="checkbox"
      className={className}
      style={style}
      ref={(input) => {
        if (input) {
          input.checked = checked
          input.indeterminate = indeterminate as boolean
          input.disabled = disabled as boolean
        }
      }}
      onChange={(e) => {
        if (onChange) {
          onChange(e)
        }
      }}
    />
  )
}

export default Checkbox
```

很简单，直接使用 ref 设置 dom 属性就可以了。

## 代码打包

接着我们在项目根目录下建立`./esbuild.js`文件

写入打包配置

```js
const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['src/checkbox.tsx'],
    outdir: 'lib',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: ['esnext'],
  })
  .catch(() => process.exit(1))
```

- entryPoints 和 ourdir 指定需要将哪些文件输入和打包输出目录
- bundle 代表是否递归引用打包文件。
- sourcemap 代表是否生成 sourcemap 源映射文件
- minify 代表是否压缩代码
- splitting 代表

  1. 多入口的是否提取公共代码
  2. 是否将 import() 异步文件单独打包

- target 定义了我们想要输出的 javascript 类型

- `format` 是设置生成的 javascript 文件的输出格式， 有 3 个值可选，`cjs`、`esm`、`iife`
  - `iife` 格式代表“立即调用函数表达式”，可以在浏览器中运行。
  - `cjs` 格式代表“CommonJS”，在 node 中运行。
  - `esm` 格式代表“ECMAScript 模块”，既可以在浏览器中使用，也可以在 node 中使用

然后使用`node ./esbuild.js` 就可以打包成功了，但是一个`typescript`项目最终要提供`d.ts`出来给外部用，但是`esbuild`最终 build 出来的内容中并没有`d.ts`，因此我们要单独运行`tsc`，稍微修改一下上面的代码。

我们在 package.json 中加入如下代码

```json
"scripts": {
    "ts-types": " tsc --emitDeclarationOnly --outDir lib",
    "build": "rm -rf lib && node ./esbuild.js && npm run ts-types"
 },
```

还是使用 `tsc` 的 `emitDeclarationOnly` 来生成 `d.ts`

然后我们在 package.json 中指定入口文件

```json
"main": "lib/checkbox.js",
"module": "lib/checkbox.js",
"types": "lib/checkbox.d.ts",
"files": [
    "lib"
 ]
```

至此打包完成，如果需要发包，我们要还需要添加测试。

## 本地预览

当然我们的项目需要预览，建立一个 `example/index.tsx` 文件

```javascript
import React, { ReactElement } from 'react'
import { render } from 'react-dom'

import Checkbox from '../src/checkbox'

function App(): ReactElement {
  return (
    <div>
      <Checkbox></Checkbox>
      <Checkbox checked={true}></Checkbox>
      <Checkbox indeterminate={true}></Checkbox>
    </div>
  )
}

render(<App />, document.querySelector('#root'))
```

这个文件作为预览 js 的打包入口；

然后建立一个`./example/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>checkbox</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./bandle.js"></script>
  </body>
</html>
```

这个 html 就引用了 `bandle.js`，接下来，我们需要打包出一个 `bandle.js`

建立一个`./example/esbuild.js` 文件，代码如下：

```js
const esbuild = require('esbuild')
const path = require('path')

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, './index.tsx')],
    outfile: path.resolve(__dirname, './bandle.js'),
    bundle: true,
    minify: true,
    target: ['esnext'],
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    },
    format: 'esm',
  })
  .then((result) => {
    console.log('watching...')
  })
```

这个 esbuild.js 是打包预览文件的配置，这里开启了监听模式，这样修改 js 就会自动打包了。

然后在 package.json 的 scripts 中添加 :

```js
"start": " node ./example/esbuild.js"
```

接着修改 js 就会自动打包了，我们一起来看下效果，唯一的缺点是没有热更新，我们需要手动刷新。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d60778365516494599540e04f2442e6b~tplv-k3u1fbpfcp-watermark.image?)

## 小结

本文结合 react 对 esbuid 这个打包工具进行了简单使用；

esbuid 的缺点

- es5 支持不是很好，不支持将 es6 转 es5。
- esbuild 没有提供 AST 的操作能力 (如 babel-plugin-import)

esbuild 的优点

esbuild 除了打包速度飞快，对于 ts、css 文件的处理也是非常友好，不需要设置各种 loader，配置简单。如果你的项目不需要兼容 es5、完全可以将一些 Monorepo 的 js 库迁移到 esbuild。

最后的预览实现方法，还可以使用 esbuild 的 serve 功能实现，大家可以阅读[官方文档]("https://esbuild.github.io/")探索。或者结合 webpack 使用 [esbuild-loader](https://github.com/privatenumber/esbuild-loader) 创建一个项目，除此之外，[vite](https://cn.vitejs.dev/)也是一个不错的选择。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
