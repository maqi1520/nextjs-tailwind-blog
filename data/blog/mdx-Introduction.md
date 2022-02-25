---
title: 'MDX 让 Markdown 步入组件时代'
date: '2022/2/25'
lastmod: '2022/2/25'
tags: [前端, React.js]
draft: false
summary: 'MDX 是一种书写格式，允许你在 Markdown 文档中无缝地插入 JSX 代码。 你还可以导入（import）组件，例如交互式图表或弹框，并将它们嵌入到内容当中。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd5d2da3013e40cd9b0d4770188bcf1d~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

在 MDX 出现之前，将 JSX 与 Markdown 混合书写时，Markdown 的优势就不存在了。 通常采是用基于模板字符串的方式，因此就需要大量的转义和繁琐的语法。

MDX 试图让书写 Markdown 和 JSX 更简单、更具有表现力。当你将组件 （甚至可以是动态的或需要加载数据的组件）与 Markdown 混合书写时，你将写出更有趣的内容。

## MDX 是什么

MDX 是一种书写格式，允许你在 Markdown 文档中无缝地插入 JSX 代码。 你还可以导入（import）组件，例如交互式图表或弹框，并将它们嵌入到内容当中。

## 前提条件

您应该熟悉 markdown 语法和 JavaScript 语法 (特别是 JSX)。

## MDX 示例

比如官网的一个例子，如下代码

```md
import {Chart} from './snowfall.js'
export const year = 2018

# Last year’s snowfall

In {year}, the snowfall was above average.
It was followed by a warm spring which caused
flood conditions in many of the nearby rivers.

<Chart year={year} color="#fcb32c" />
```

展示效果

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05367d51dc4b42beb7042ac90d2aaff5~tplv-k3u1fbpfcp-watermark.image?)

## 如何使用

在 `create-react-app` 中 只需要安装 `@mdx-js/loader`， `create-react-app@5` 支持自定义 loader，代码示例如下

src/App.jsx

```jsx
/* eslint-disable import/no-webpack-loader-syntax */
import Content from '!@mdx-js/loader!./content.mdx'

export default function App() {
  return <Content />
}
```

src/content.mdx

```md
# Hello, world!

This is **markdown** with <span style={{color: "red"}}>JSX</span>: MDX!
```

如果是 webpack 项目只需要加一个 `@mdx-js/loader` 就可以支持

```jsx
module.exports = {
  module: {
    // …
    rules: [
      // …
      {
        test: /\.mdx?$/,
        use: [
          // `babel-loader` is optional:
          { loader: 'babel-loader', options: {} },
          {
            loader: '@mdx-js/loader',
            /** @type {import('@mdx-js/loader').Options} */
            options: {
              /* jsxImportSource: …, otherOptions… */
            },
          },
        ],
      },
    ],
  },
}
```

## 插件支持

MDX 也支持插件配置，也就是原先的 markdown 插件

比如要让 markdown 支持表格和 `checkboxList` ，可以使用 `remark-gfm` 插件

比如要让 markdown 支持数学公式 可以使用 `rehype-katex` 插件

在的 option 可以传入参数，代码如下：

```js
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'


module.exports = {
  module: {
    // …
    rules: [
      // …
      {
        test: /\.mdx?$/,
        use: [
          // `babel-loader` is optional:
          {loader: 'babel-loader', options: {}},
          {
            loader: '@mdx-js/loader',
            /** @type {import('@mdx-js/loader').Options} */
            options: {remarkPlugins: [remarkGfm], rehypePlugins: [rehypeKatex]}}
          }
        ]
      }
    ]
  }
}

```

当然也可以支持自定义插件，比如 `img` 要加上默认样式，限制其最大宽度，`href` 跳转要改成新窗口打开等 ，详情可以查看 [unifiedjs.com](https://unifiedjs.com/learn/guide/create-a-plugin/)

## 定义组件

在支持了 mdx 之后， 可以给 mdx 定义组件, 比如给 H1 传递默认样式等，或者加入默认组件，例如 https://beta.reactjs.org/ 就加入了很多自定义组件，代码示例如下：

```js
import React from 'react'
import ReactDom from 'react-dom'
import Post from './post.mdx' // Assumes an integration is used

export const H1 = ({ className, ...props }: HeadingProps) => (
  <H1 className={cn(className, 'text-5xl font-bold leading-tight')} {...props} />
)

const components = {
  h1: H1,
}

ReactDom.render(<Post components={components} />, document.querySelector('#root'))
```

## MDX provider

每个文档都要传 components 很麻烦？ 我们可以在最外层导入 `MDXProvider`，提供 components，组件就可以了。

```jsx
import React from 'react'
 import ReactDom from 'react-dom'
 import Post from './post.mdx' // Assumes an integration is used to compile MDX -> JS.
 import {Heading, /* … */ Table} from './components/index.js'
+import {MDXProvider} from '@mdx-js/react'

 const components = {
   h1: Heading.H1,
   // …
   table: Table
 }

 ReactDom.render(
-  <Post components={components} />,
+  <MDXProvider components={components}>
+    <Post />
+  </MDXProvider>,
   document.querySelector('#root')
 )
```

## 在线运行

以上实例都是在构建时运行，那么能到让 MDX 在浏览器运行呢，比如未来，博客的编辑器支持 MDX， 那么我们的博客文章页面就可以有更多交互了。

比如数据通过服务端返回，下面代码是 next.js 示例

```jsx
import { useState, useEffect, Fragment } from 'react'
import * as runtime from 'react/jsx-runtime.js'
import { compile, run } from '@mdx-js/mdx'

export default function Page({ code }) {
  const [mdxModule, setMdxModule] = useState()
  const Content = mdxModule ? mdxModule.default : Fragment

  useEffect(() => {
    ;(async () => {
      setMdxModule(await run(code, runtime))
    })()
  }, [code])

  return <Content />
}

export async function getStaticProps() {
  const code = String(await compile('# hi', { outputFormat: 'function-body' /* …otherOptions */ }))
  return { props: { code } }
}
```

## 实时运行

列如官方的 palyground，就可以实时运行，左边写代码，右侧展示文档

![s19130202242022](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16bafa48eed84d429227aa6f13d71ebf~tplv-k3u1fbpfcp-zoom-1.image)

最简单的代码如下

```jsx
import { VFile } from 'vfile'
import { evaluate } from '@mdx-js/mdx'

const value = '## header'

const file = new VFile({ basename: 'example.mdx', value })

const { default: Result } = await evaluate(file, runtime)
```

这个 Result 就是一个 react 组件，如要实现相似功能可以参考官方 [github](https://github.com/mdx-js/mdx/blob/main/docs/_component/editor.client.js) 中的 editor.client.js。

## 小结

Markdown 所有程序员都爱，Markdown 在标准化、结构化、组件化都存在硬伤，有了 MDX ，Markdown 有了富交互、内容形态的编写，希望 MDX 尽早尽快更多的投入到的互联网产品中，也希望 MDX 的解析也来越标准化。

推荐阅读 [精读《对 Markdown 的思考》](https://zhuanlan.zhihu.com/p/470082866)

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
