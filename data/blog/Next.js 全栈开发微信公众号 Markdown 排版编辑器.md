---
title: Next.js 全栈开发微信公众号 Markdown 排版编辑器
date: 2022/11/30 00:42:25
lastmod: 2023/1/25 11:42:14
tags: [React.js, 前端, Markdown]
draft: false
summary: 阅读本文，你将收获： 学会使用 Monaco Editor 开发多文件编辑器；学会使用 mdx 在线编译 ；实现剪切板的劫持；学会使用云函数和云数据写接口；
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/722aa1c1cef346aba9cc4db65319fb69~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 阅读本文，你将收获：

1. 学会使用 Monaco Editor 开发多文件编辑器
1. 学会使用 mdx 在线编译
1. 了解了 JavaScript clipboard api，实现剪切板的劫持；
1. 学会使用云函数和云数据写接口
1. 学会使用 Next.js 的路由重写功能

## 前言

其实应该叫微信公众号 MDX 排版编辑器，因为知道 markdown 的人很多，而知道 MDX 的人却很少，之前也写过一篇文章[《[MDX Editor] 微信排版工具新选择》](https://juejin.cn/post/7081948276169113631)，介绍了我开发这款编辑器的初衷，以及它的功能，阅读量那是相当的低，今天，我们将从技术实现的角度，来记录它的实现过程，没体验过的朋友可以先体验下。

- [在线地址](https://editor.runjs.cool/)
- [Github 地址](https://github.com/maqi1520/mdx-editor)

那标题为什么要叫 “Markdown 排版编辑器呢”？ 因为 MDX 是 markdown 和 JSX 的结合，它让我们的文档即可以写 markdown 也可以写 React 组件，于是我想用 MDX 的强大功能来扩展微信公众号编辑器的不足。其实编辑器部分可以是纯 React 实现，而我选择使用 Next.js + 云开发，让它从单纯的编辑器晋升为我的写作工具，拥有了云端保存数据能力，本文收录在[《 Next.js 全栈开发实战》](https://juejin.cn/column/7140121965360054308) 专栏中。

## 技术栈

- Next.js
- Tailwindcss
- 云函数+云数据库

这套技术栈的优势是什么？

- 纯 JavaScript 开发的全栈应用
- “免费部署”，我们只需要一个域名。

相信通过阅读本文，你也可以开发出一个全栈应用。

## 编辑器实现

[Monaco Editor](https://microsoft.github.io/monaco-editor/ 'monaco-editor') 是 VS Code 中使用的开源代码编辑器， 拥有代码高亮和代码自动补全的功能，Monaco Editor 支持的语言有很多，包含 html、css、JavaScript 和 markdown 等，所以用它作为我们的编辑器就再合适不过了，Monaco Editor 有 2 种加载方式，分别是 amd 和 esm，也就是 Requirejs 和 ES Modules。

### monaco-editor 实现 markdown 编辑器

如果选择使用 Requirejs 来加载，我们使用几行代码就可以实现一个编辑器。

首先使用在 html 中引入 monaco-editor 的 cdn 地址，并且配置 require config。

```html
<div id="app"></div>
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/loader.js"></script>
<script>
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs' } })
</script>
```

在 React 的 `useEffect` hoooks 中使用 `monaco.editor.create` 创建一个 editor，使用 `onDidChangeModelContent` 方法监听 editor 中内容改变， 并且设置 state 值，这样就得到了一个实时编辑器效果。代码如下：

```jsx
import React, { useState, useEffect, useRef } from 'react'
import ReactDom from 'react-dom'

const App = function () {
  const [value, setValue] = useState('# 标题1 \r\r## 标题二\r\r正文')
  const ref = useRef()

  useEffect(() => {
    var editor = monaco.editor.create(ref.current, {
      value,
      language: 'markdown',
      minimap: { enabled: false },
      theme: 'vs-dark',
    })
    editor.onDidChangeModelContent(() => {
      setValue(editor.getValue())
    })
  }, [])

  return (
    <div className="flex">
      <div ref={ref} className="flex-1" style={{ height: 800 }}></div>
      <div className="flex-1" style={{ height: 800 }}>
        {value}
      </div>
    </div>
  )
}
require(['vs/editor/editor.main'], function () {
  ReactDom.render(<App />, document.getElementById('app'))
})
```

[代码片段](https://code.juejin.cn/pen/7170613642608508941)

实现效果如下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42a26b233b944809bd970ca3cb3edca1~tplv-k3u1fbpfcp-zoom-1.image)

可能有同学对 `onDidChangeModelContent` 方法比较疑惑，中间有个单词`Model`，为什么不是`onDidChangeContent`呢？因为 Monaco Editor 在创建的时候，自动帮我创建了一个 Model， Editor 相当于一个容器，容器可以设置 Model、切换 Model，比如 vscode 中，每打开一个文件就是一个 Model，文件切换就是切换 model，每个文件都有状态，比如光标位置，历史记录等，这些状态都存在 model 中，这样就不会因为文件切换导致状态混淆，接下来我们就实现下多文件的切换。

### monaco-editor 实现多文件编辑

在 mdx editor 中，除了 markdown 编辑器，还需要有 css 和 js，因此，我们将初始的 value 改成一个对象

```js
const [value, setValue] = useState({
  md: '# 标题1 \r\r## 标题二\r\r正文',
  css: '.markdown-body{ color:#333}',
  js: 'console.log("test")',
})
```

接着，再创建一个 type 用于区分当前文件类型

```js
const ref = useRef()
const [type, setType] = useState('md') // 当前类型
```

然后在 `useEffect` 中创建 editor 和所有文件的 model，并且保存到 `ref` 中

```js
const refEditor = useRef() // editor 实例
const refModels = useRef() // 所以文件的 model
useEffect(() => {
  var editor = monaco.editor.create(ref.current, {
    minimap: { enabled: false },
    theme: 'vs-dark',
  })
  const markdownModel = monaco.editor.createModel(value.md, 'markdown')
  markdownModel.onDidChangeContent(() => {
    setValue((prev) => ({ ...prev, md: markdownModel.getValue() }))
  })
  const cssModel = monaco.editor.createModel(value.css, 'css')
  cssModel.onDidChangeContent(() => {
    setValue((prev) => ({ ...prev, css: cssModel.getValue() }))
  })

  const jsModel = monaco.editor.createModel(value.js, 'javascript')
  jsModel.onDidChangeContent(() => {
    setValue((prev) => ({ ...prev, js: jsModel.getValue() }))
  })

  refEditor.current = editor
  refModels.current = {
    md: markdownModel,
    css: cssModel,
    js: jsModel,
  }
}, [])
```

最后根据 `type` 来设置当前的 model。

```js
useEffect(() => {
  if (refEditor.current && refModels.current && refModels.current[type]) {
    refEditor.current.setModel(refModels.current[type])
  }
}, [type])
```

这样就使用了 monaco-editor 实现了多文件编辑功能，一起来看下效果

[代码片段](https://code.juejin.cn/pen/7170681581848231948)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65a512eb37814e9a97e03e7fe2bead41~tplv-k3u1fbpfcp-zoom-1.image)

每个 tab 都有历史记录，都可以实现撤销和重做，并且拥有语法高亮，这些都是 monaco-editor 帮我们实现的。

接下来我们需要将 mdx 编译成可以 react 组件或者 html。

### 编译 mdx

[mdx](https://mdxjs.com/packages/mdx/ 'mdx') 提供了 3 个方法，可以将 mdx 编译成 javascript 分别是 compile、run 和 evaluate；

run 和 compile 需要配合使用

比如：在服务端使用 node.js 编译代码

```js
import { compile } from '@mdx-js/mdx'

const code = String(await compile('# hi', { outputFormat: 'function-body' }))
```

然后再客户端上将代码用 run 函数执行

```js
import * as runtime from 'react/jsx-runtime'
import { run } from '@mdx-js/mdx'

const code = '' // To do: get `code` from server somehow.

const { default: Content } = await run(code, runtime)
```

这样就得到了一个 MDXContent 组件

```js
[Function: MDXContent]
```

这种方式需要前后端配合才可以完成，而 `evaluate` 函数允许编译动态导入的内容；
比如下面代码就可以在浏览器完成：

```jsx
import React, { useState, useEffect, useRef } from 'react'
import ReactDom from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import * as Babel from '@babel/standalone'
import * as runtime from 'react/jsx-runtime'
import { evaluate } from '@mdx-js/mdx'
import { MDXProvider, useMDXComponents } from '@mdx-js/react'
import remarkGfm from 'remark-gfm'

useEffect(() => {
  if (refTime.current) {
    clearTimeout(refTime.current)
  }
  refTime.current = setTimeout(async () => {
    //console.log(value.md)
    try {
      const { default: Content } = await evaluate(value.md, {
        ...runtime,
        remarkPlugins: [remarkGfm],
        format: 'mdx',
      })

      const html = ReactDOMServer.renderToString(<Content />)

      console.log(html)
    } catch (error) {
      console.log(error)
    }
  }, 500)
}, [value])
```

上面代码中，我们监听了 `value` 值的变化，使用 `evaluate` 函数编译 `vlaue` 中的 `md` 值，就可以得到 `<Content />`组件，并且使用 `ReactDOMServer.renderToString` 方法将组件编译成 html。
上面底阿妈为什么需要传入 react runtime？ 因为 mdx 不但支持 react，还支持 vue 和 preact 等， 不同运行时的代码可以使用相应的包导入实现即可。

我们在马上掘金看下效果

[代码片段](https://code.juejin.cn/pen/7170930559256887311)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a914e00b9fc4e0db0df563af825dea1~tplv-k3u1fbpfcp-zoom-1.image)

打印的 html，在 console 中自动有了格式化效果，此时如果我在 markdown 中写入一个 react 组件，比如以下代码：

```md
# 标题 1

## 标题二

正文

<Test/>
```

控制台中就会报错，提示找不到这个 `<Test/>` 组件
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/054b4a827ddc4fcc89741b0e7efa41ee~tplv-k3u1fbpfcp-zoom-1.image)

因此我们需要实现将 javascript tab 文件下的代码，传递给 `MDXProvider`，实现代码如下：

```jsx
import { MDXProvider, useMDXComponents } from '@mdx-js/react'

const html = ReactDOMServer.renderToString(
  <MDXProvider components={{ Test }}>
    <Content />
  </MDXProvider>
)
```

在 javascript tab 下，写 React 组件代码，比如我们写一个 `Test` 组件，并且导出为对象，代码如下：

```jsx
function Test() {
  return <p style={{ color: 'red' }}>test</p>
}

export default {
  Test,
}
```

但是，我们通过 monaco editor 得到的 jsx 代码是一个字符串， 而 MDXProvider 需要的 components 是一个对象，因此 jsx 需要在线编译成可执行的 react 代码，然后再返回一个组件对象就可以了。

### 浏览器编译 react

我们可以使用 [@babel/standalone](https://babeljs.io/docs/en/babel-standalone)，在浏览器中就可以将 jsx 代码编译为可执行的 react 代码

```js
import * as Babel from '@babel/standalone'

let RootComponents = {}

if (value.js) {
  try {
    //jsx 先通过编译成js
    let res = Babel.transform(value.js, { presets: ['react'] })
    let code = res.code.replace('export default ', 'return ')
    console.log(code)

    RootComponents = new Function('React', code)(React)

    if (!validateReactComponent(RootComponents)) {
      console.log('javascript is not react component')
    }
  } catch (error) {
    console.log(error)
  }
}
```

在控制台中，我们可以查看打印的，为编译后的 code，变成了 React javascript 代码 `React.createElement`

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f78956c6c8e14fd4bc225d566f6c05c9~tplv-k3u1fbpfcp-zoom-1.image)

但是，编译后的代码中没有引入 React，那么我们可以使用 `new Function` 将当前环境的 `React` 对象传递给编译后的组件代码，就可以得到一个 RootComponents 对象了。
RootComponents 直接可以供给 MDXProvider 调用。

我们在马上掘金看下效果

[代码片段](https://code.juejin.cn/pen/7170930559256887311)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41d9d34a33f9454ca35147d6b12037ba~tplv-k3u1fbpfcp-zoom-1.image)

我们看到 test 文字为红色，到此我们实现了 MDX 在线编译功能。

### iframe 预览

目前我们的编辑器，还没有实现预览区的效果，我选择使用 iframe 来实现样式隔离，在 react 中可以直接使用 `srcDoc` 属性来动态改变 iframe 的内容，那么我们只需要将刚才编译后的 html 设置到 state 中，这样就可以实现实时渲染了

```jsx
<div className="iframe">
         <iframe sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
               srcDoc={`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue",
          "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI",
          "Microsoft YaHei", Arial, sans-serif;
        text-align: justify;
        font-size: 17px;
        color: #333;
        padding: 20px 16px 9px;
      }
      body * {
        box-sizing: border-box;
        box-sizing: border-box !important;
        word-wrap: break-word !important;
      }
    </style>
    <style id="_style">${value.css}</style>
  </head>
  <body><div class="markdown-body">${html}</div></body>
</html>`} />
</div>
</div>
```

给 iframe 添加一些样式

```js
.iframe{
  padding: 16px;
  width: 320px;
  border: 4px rgb(192 132 252) solid;
  border-radius: 40px;
  height: 730px;
  display: block;
  margin: 0 auto;
  background: black;
}

iframe{
  border-radius: 20px;
  width: 320px;
  height: 720px;
  border: 0;
  background: #fff;
}
```

一起来看下效果，这样是否已经有那么点效果了呢 ？

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86e90a027bf34b86b8658338b29c392a~tplv-k3u1fbpfcp-zoom-1.image)
如上图中，在 md 中，写了一块 js 代码块，右侧编辑区并没有实现语法高亮。因此需要继续优化，在 mdx 中实现语法高亮的功能。

### 代码语法高亮

markdown 在编译过程中会涉及 3 种 ast 抽象语法树 ， remark 负责转换为 mdast，它可以操作 markdown 文件，比如让 markdown 支持更多格式（比如：公式、脚注、任务列表等），需要使用 remark 插件； rehype 负责转换为 hast ，它可以转换 html，比如给代码高亮，这一步是在编译 HTML 后完成的。代码语法高亮有现成的插件，我们安装一个 `rehype-prism-plus` 插件，

```js
import remarkGfm from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'

const { default: Content } = await evaluate(value.md, {
  ...runtime,
  useMDXComponents,
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypePrismPlus, { ignoreMissing: true }]],
  format: 'mdx',
})
```

在 evaluate 函数中配置 remarkPlugins 和 rehypePlugins，最后我们到 github [prism-themes](https://github.com/PrismJS/prism-themes 'prism-themes') 中复制一份高亮样式代码到我们的 css 文件中，一起来看下效果吧！
[代码片段](https://code.juejin.cn/pen/7171092385114374151)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ada58003896049c0955719f3e89f6ba2~tplv-k3u1fbpfcp-zoom-1.image)

至此，我们的 mdx 编辑器已经完成了 90%，还有 10 % ，需要需要支持一键复制到微信公众号后台。

## 复制到微信公众号后台

常规的富文本编辑器都有劫持剪切板内容这样的功能，这样才可以实现粘贴带格式。微信公众后台使用的是 ueditor，也有这样的功能。

比如你在控制台中执行以下代码，接着在文档中选中任意文本，进行复制

```js
document.addEventListener('copy', function (e) {
  e.clipboardData.setData('text/plain', 'Hello, world!')
  e.clipboardData.setData('text/html', '<b>Hello, world!</b>')
  e.preventDefault() // 阻止默认事件
})
```

然后你到任意位置粘贴都会变成“Hello, world”，只不过在支持富文本编辑的地方会变得加粗，这就是剪切板劫持，因此我们 state 中的 html 和 css，需要转成行内样式，这样在粘贴的时候才会有样式。

有一个 npm 包很好用，[Juice](https://www.npmjs.com/package/juice 'juice') - 可以将 html 和 css 转变为有内联样式的 html。

比如官方的例子

```js
var juice = require('juice')
var result = juice('<style>div{color:red;}</style><div/>')
```

转变后的结果

```html
<div style="color: red;"></div>
```

那么，我们就可以在页面上加一个复制按钮，首先使用 juice 将 html 和 css 转变为内联的 html，然后将装换后的 html 写进 `clipboardData` 中，这样就实现了微信公众号排版复制功能。

```js
import juice from "juice";

const handleCopy = () => {
    const copyValue = juice.inlineContent(`<div class="markdown-body">${html}</div>`, basecss + value.css)
    document.addEventListener('copy', function (e) {
      e.clipboardData.setData('text/plain', copyValue);
      e.clipboardData.setData('text/html', copyValue);
      e.preventDefault(); // 阻止默认事件
    });
    document.execCommand('copy')
}

return (
  ...
  <button onClick={handleCopy}>复制到微信后台</button>
  ...
)
```

一起来看下效果。

[代码片段](https://code.juejin.cn/pen/7171349691837120544)

![公众号后台粘贴](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62460d15b14846febf45b6c5b9e7a03b~tplv-k3u1fbpfcp-watermark.image?)

至此我们的编辑器已经完成。当然产品细节决定产品质量，码上掘金中的例子，还需要继续打磨优化样式，加入更多功能，才可以开发出一款比较完善的产品。

## 云函数开发接口

为了让数据保存到云端，我选择使用云函数来开发接口，使用云数据库来保存数据。至于为什么？主要是因为便宜。

目前腾讯云开发 19.9 一月，我这里选择使用 [laf](https://www.lafyun.com/ 'laf')

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/053a8ed1bd1f47a7908d3a2ce9007b29~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

laf 是一个开源的云开发平台，可以像写博客一样写函数，随手上线，最重要的是官网体验版现在是免费的。点击官网，右上角在线体验，注册一个账号就可以使用，每个用户拥有内存:256MB, 数据库:1GB, 存储:3GB。

### 创建一个云函数

输入以下代码，便可以创建一个 get 和 post 接口

```ts
import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query, method } = ctx
  if (method === 'POST') {
    const db = cloud.database()
    const r = await db.collection('mdx').add(body)
    return r
  }
  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('mdx').doc(query.id).get()
  return r
}
```

POST 访问，默认将 body 中的数据全部保存，get 访问，通过 id 查询数据。

保存后点击发布，就可以在控制台获得 api url `https://XXXXX.lafyun.com:443/test-api`

## Next.js 请求路径重写

![api默认允许跨域](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e87b52015ca5485ea3dec26283998037~tplv-k3u1fbpfcp-watermark.image?)

laf 提供的 URL 默认是允许跨域的，如果我们使用 create react app 创建应用，那么通过控制台是可以看到访问的接口，为了防止其他人知道你的 url，滥用数据，因此我们选择使用 Next.js 来开发，可以将 api 配置在环境变量中，通过 Next.js 的路由重写功能。

在 `next.config.js` 添加以下配置

```js
 async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path?secret=${process.env.MY_SECRET_TOKEN}`,
      },
    ]
  },
```

这样用户访问 `http://localhost:3000/api/*` 下的路径就会自动带上 SECRET，而访问地址是看不到的

在云函数装加入秘钥判断即可。

```ts
import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  const { auth, body, query, method } = ctx
  // 加入秘钥判断，防止滥用
  if (query.secret !== 'MY_SECRET_TOKEN') {
    ctx.response.status(403)
    return '秘钥错误，无权限'
  }
  if (method === 'POST') {
    const db = cloud.database()
    const r = await db.collection('mdx').add(body)
    return r
  }
  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('mdx').doc(query.id).get()
  return r
}
```

这样别人知道你的 url，也无法滥用使用云函数接口了。

## 部署

最后，部署我们直接使用 vecel 部署，之前的文章介绍过多次，这里就不赘述了

## 小结

1. 本文从零开始使用 Monaco Editor 开发多文件编辑器；
1. 使用 mdx 实现在线编译；
1. 了解了 JavaScript clipboard api，实现剪切板的劫持
1. 使用 laf 云函数和云数据开发了 api 节课；
1. 最后使用 Next.js 的路由重写功能，防止云函数 api 的暴露。

好了，以上就是本文的全部内容，你学会了吗？接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的[《 Next.js 全栈开发实战》](https://juejin.cn/column/7140121965360054308) 专栏，感谢您的阅读。
