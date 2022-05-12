---
title: '实现一个 Code Pen：（四）浏览器编译代码'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '前面的文章中，我们配置好了编辑器，实现了 css、html、js 的编辑，现在我们需要做代码实时运行的功能了，并且可以直接写 less、scss、JavaScript、typescript。'
images: []
authors: ['default']
layout: PostLayout
---

## 前言

前面的文章中，我们配置好了编辑器，实现了 css、html、js 的编辑，现在我们需要做代码实时运行的功能了，并且可以直接写 less、scss、可以写 JavaScript、typescript、react。这个就涉及到了浏览器编译代码的逻辑，前期我们编译语言少一点、先把整体流程跑通，后面可以对语言和功能再慢慢丰富，这也是做项目的主要思路。

## Iframe 实时运行

想要一个页面实时运行，并且 JS 变量不污染全局，Iframe 是一个不错的选择，得益于 iframe 有一个 `srcDoc`，我们可以直接更改里面的内容，页面就会实时变更和渲染， 业内的编辑器也是这么做的，一起看看下最简单的实现代码吧。

```js
import React, { useState, useEffect } from 'react'
import Editor from './Editor'
import { useLocalStorage } from 'react-use'

function App() {
  const [html, setHtml] = useLocalStorage('html', '')
  const [css, setCss] = useLocalStorage('css', '')
  const [js, setJs] = useLocalStorage('js', '')
  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>${html}</body>
          <script>${js}</script>
        </html>
      `)
    }, 800)

    return () => clearTimeout(timeout)
  }, [html, css, js])

  return (
    <>
      <div className="pane">
        <Editor language="html" value={html} onChange={setHtml} />
        <Editor language="css" value={css} onChange={setCss} />
        <Editor language="javascript" value={js} onChange={setJs} />
      </div>
      <div className="pane">
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          frameBorder="0"
          width="100%"
          height="100%"
        />
      </div>
    </>
  )
}

export default App
```

首先我们安装了`react-use`, 这个 hooks 是目前比较流行的 hook 库，使用`useLocalStorage`, 将数据存储到 LocalStorage 中，这样可以放在刷新页面的时候数据丢失。当然这是最简单的代码逻辑，为了防止整个 iframe dom 的销毁和重建，我使用 postMessage，具体代码可以直接看 [Github](https://github.com/maqi1520/next-code-pen 'next-code-pen')

## JS 编译

以上代码逻辑, 编辑器实现了原生 js 和 css 的支持，但是不支持 react 和 typescript，若要支持，需要在插入 `srcDoc` 之前将代码表编译成 es5，其实 babel 有个游览器版本`@babel/standalone`，并且有 presets 预设，支持 react 和 typescript， 只需要引入 srcipt 就可以，详情可以参考[官方文档](https://www.babeljs.cn/docs/babel-standalone 'babel 官方文档')

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-presets="typescript">
  const x: number = 0
  console.log(x)
</script>
```

以上代码就可以支持在浏览器执行

接下来我们需要支持 react 代码

```js
import * as Babel from '@babel/standalone'

function compileJs(code) {
  const res = Babel.transform(code, {
    presets: ['react'],
  })
  return res.code
}
```

其实也很简单只需要设置 `presets` 设置为 react 就可以将编译 jsx 为 es5 了。

## 编译 typescript

编译 typescript 也是如此，需要注意的是 typescript 需要传入一个 `filename` 才可以

```js
function compileTs(code) {
  const res = Babel.transform(code, {
    presets: ['typescript'],
    filename: 'index.ts',
  })
  return res.code
}
```

## Less 编译

大部分同学都知道 less 使用的 2 种方式

1. 在 Node.js 环境中使用 Less

```bash
npm install -g less
lessc styles.less styles.css
```

2. 在浏览器环境中使用 Less

```html
<link rel="stylesheet/less" type="text/css" href="styles.less" />
<script src="//cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"></script>
```

3. 我们的需求也是在浏览器中执行，但我们可以将编译的逻辑放在 web worker 中

```js
import Less from 'less/lib/less'
const less = Less()
less.PluginLoader = function () {}

async function compileLess(code) {
  return await less.render(code).then((res) => res.css)
}
```

## Scss 编译

scss 编译我选择的是 sass.js

同样首先需要安装

```bash
npm install -g sass.js
```

安装完成后，可以看下 node_modules 中的目录

![sass.js 目录](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61a2d85aecfd4b789c1850796532baa2~tplv-k3u1fbpfcp-zoom-1.image)

我们发现目录中有个 `sass.worker.js`, 这个就 编译的 web worker js 代码， sass.js 已经将编译的逻辑独立到了这个 js 中，使用的时候需要设置 worker 的路径。
所以我们需要手动拷贝 `node_modules` 下的 `sass.worker.js` 到 `public/vendor` 中，下面是实现代码

```js
import Sass from 'sass.js/dist/sass'
Sass.setWorkerUrl('/vendor/sass.worker.js')

function compileScss(code) {
  const sass = new Sass()
  return new Promise((resolve, reject) => {
    sass.compile(code, (result) => {
      if (result.status === 0) return resolve(result.text)
      reject(new Error(result.formatted))
    })
  })
}
```

## 小结

预览地址：https://code.runjs.cool/pen/create

代码仓库：https://github.com/maqi1520/next-code-pen

本篇中浏览器编译的代码都很简单，但我却花了我几天时间，主要是这些代码都用的比较少，我又需要将编译的逻辑放入 web worker 中，然而 web worker 又没有 document 对象，所以不能直接使用 browser 版本的 js。当然目前还没实现 react typescript 的编译功能，先不卡在这了，把这项功能加入到 Todo List 中吧。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
