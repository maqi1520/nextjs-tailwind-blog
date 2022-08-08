---
title: 'Markdown 写 PPT 是如何实现的？'
date: '2022/8/9'
lastmod: '2022/8/9'
tags: [Next.js]
draft: false
summary: '一个非常好用的工具 slidev, 可以使用 markdown 来制作演示文稿，其他类似的工具还有 Nodeppt、 marp 等，那么这类工具是如何实现的？'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c412b67dc554e2da8acd4dd549a40e3~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

Markdown 是一种轻量的标记语言，我们只需要写 md 格式文件，不必考虑文档的排版，被广泛用于博客写作，技术文档编写等，程序员们都热爱，但我们工作中除了写文档，有时候还需要汇报工作，技术分享等，需要用到 PPT，但设计 PPT 可能不是每个程序员所喜欢的，所以我们可以使用一个非常好用的工具 [slidev](https://cn.sli.dev/ 'slidev'), 可以使用 markdown 来制作演示文稿， 这个工具很多小伙伴都知道，尤大的分享就经常使用，其他类似的工具还有 [Nodeppt](https://nodeppt.js.org/)、 [marp](https://marp.app/) 等，那么这类工具是如何实现的？

## 使用

以 slidev 为例，我们只需要使用`---`分割，就可以将文档分为一页一页的幻灯片。

```md
---
background: https://sli.dev/demo-cover.png
---

# 欢迎使用 Slidev!

为开发者打造的演示文稿工具

---

# 第二页

- 📄 在单一 Markdown 文件中编写幻灯片
- 🌈 主题，代码高亮，可交互的组件，等等
- 😎 阅读文档了解更多！
```

![slidev 演示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b68c4a07d0a4810bd17d7f547a34d93~tplv-k3u1fbpfcp-zoom-1.image)

## 实现

### markdown 解析

常用的 javascript markdown 解析器有 [markdown-it](https://github.com/markdown-it/markdown-it) 、[marked](https://github.com/markedjs/marked) 、[remark](https://github.com/remarkjs/remark)。其中 [gatsbyjs](https://www.gatsbyjs.com/) 和 [gitbook](https://www.gitbook.com/) 使用的是 remark 来解析，而 Slidev 和 VuePress 就是使用 markdown-it 解析。
![近一年npm 下载量](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6daaf2d83a914f28b8f5567e823edaaf~tplv-k3u1fbpfcp-zoom-1.image)

比如有下面这样一个 md 文件

```md
# 欢迎使用 Slidev!

为开发者打造的演示文稿工具

---

# 第二页

- 📄 在单一 Markdown 文件中编写幻灯片
- 🌈 主题，代码高亮，可交互的组件，等等
- 😎 阅读文档了解更多！
```

为了能在单一 Markdown 文件中编写幻灯片，我们可以将 md 字符串根据`---`拆分，拆分后的每段使用 markdown-it 来解析，然后将解析好的 HTML 丢回 section 元素里，并且给 section 设置幻灯片的样式就可以实现简单的效果。

最简单的代码如下

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import markdownit from 'markdown-it'

const markdown = new markdownit()

const md = '...'

const slides = md.split('---')

function SlideItem({ item }) {
  return (
    <section className="slidev-layout cover">
      <div className="my-auto">
        <div
          dangerouslySetInnerHTML={{
            __html: markdown.render(item),
          }}
        ></div>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="app">
      {slides.map((item, index) => (
        <section key={index} className="slidev-content">
          <SlideItem item={item} />
        </section>
      ))}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

[代码片段](https://code.juejin.cn/pen/7124597297446387748)

### 幻灯片样式

markdown 只能解析成文档格式，但 PPT 的样式是多样的，可以设置背景、可以设置布局等，所以需要给 md 文件设置更多的字段，在文档最前面三点划线之间书写的有效的 YAML，称为 Front Matter，Front Matter 可以给 markdown 设置更多字段属性。

```md
---
background: https://sli.dev/demo-cover.png
class: text-white
---

# Slidev

This is the center page.

---

layout: image-right
image: https://source.unsplash.com/collection/94734566/1920x1080

---

# Page 2

This is a page with a image on the right.
```

所以得实现一个解析器将 md 文件解析成 json 格式

```js
// 解析 yml，这里只支持一层
function parseMatter(code) {
  let data = {}
  const lines = code.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const item = lines[index]
    const arr = item.split(': ')
    if (arr.length === 2) data[arr[0].trim()] = arr[1].trim()
  }
  return data
}
// 解析成 Front Matter 和 content
function matter(code) {
  let data = {}
  const content = code.replace(/---\r?\n([\s\S]*?)---/, (_, d) => {
    data = parseMatter(d)
    return ''
  })
  return { data, content: content.trim() }
}
// 解析 md 格式为 json
function parse(md) {
  const slides = []

  const lines = md.split('\n')

  let start = 0

  function slice(end) {
    if (start === end) {
      return
    }
    const raw = lines.slice(start, end).join('\n')
    slides.push({
      ...matter(raw),
      raw,
    })
    start = end + 1
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()
    if (line.match(/^---+/)) {
      slice(i)
      const next = lines[i + 1]
      //  跳过一次 `---`, 找下一个
      if (line.match(/^---([^-].*)?$/) && !next?.match(/^\s*$/)) {
        start = i
        for (i += 1; i < lines.length; i++) {
          if (lines[i].trimEnd().match(/^---$/)) break
        }
      }
    }
  }
  if (start <= lines.length - 1) slice(lines.length)
  return slides
}
```

上面的解析代码只是简易实现，yaml 格式只支持一层，具体大家可以参考 [@slidev/paser](https://github.com/slidevjs/slidev/blob/main/packages/parser/src/core.ts '@slidev/paser')。

经过解析后我们可以获得如下 json

```js
;[
  {
    data: {
      background: 'https://sli.dev/demo-cover.png',
      class: 'text-white',
    },
    content: '# Slidev\n\nThis is the center page.',
  },
  {
    data: {
      layout: 'image-right',
      image: 'https://source.unsplash.com/collection/94734566/1920x1080',
    },
    content: '# Page 2\n\nThis is a page with a image on the right.',
  },
]
```

有了 JSON 数据，我们就可以给 section 设置样式排版了

```js
const layout = {
  default: DefaultSlideItem,
  'image-right': ImageRight,
}

function App() {
  return (
    <div className="app">
      {slides.map((item, index) => {
        const Slide = layout[item.data.layout || 'default']
        return <Slide item={item} key={index} />
      })}
    </div>
  )
}
```

可以根据 layout 字段渲染不同的模板

以下代码是 `ImageRight` 模板的代码

```jsx
function ImageRight({ item }) {
  return (
    <section className="slide-content grid grid-cols-2">
      <SlideItem item={item} />
      <div
        className="h-full w-full"
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundImage: item.data.image ? `url(${item.data.image})` : '',
        }}
      ></div>
    </section>
  )
}
```

那么我们只需要给 layout 字段扩展不同的渲染模板，就可以实现丰富的幻灯片样式了。

[代码片段](https://code.juejin.cn/pen/7128982347789107240)

### 键盘控制

接下来我们要实现键盘控制，很简单只需要在 `useEffect` 中监听 `keydown` 事件控制当前页面，就可以实现翻页效果了。

```js
function App() {
  const [current, setCurrent] = React.useState(0)
  React.useEffect(() => {
    const handleKeydown = (e) => {
      e.preventDefault()
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        if (current < slides.length - 1) {
          setCurrent((prev) => prev + 1)
        }
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        if (current > 0) {
          setCurrent((prev) => prev - 1)
        }
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [current])
  return (
    <div className="app">
      {slides.map((item, index) => {
        const Slide = layout[item.data.layout || 'default']
        return (
          <Slide
            style={{
              display: current === index ? '' : 'none',
            }}
            item={item}
            key={index}
          />
        )
      })}
    </div>
  )
}
```

[代码片段](https://code.juejin.cn/pen/7128996296794308643)

### 代码高亮

入在 PPT 中要实现代码块的高亮，排版很麻烦，在 sildev 中实现代码块高亮却很方便，接下来我们就实现下代码块高亮的效果。

主要借助于[prismjs](https://prismjs.com) 这个插件，可以参考之前写的这篇文章[《使用 Prism.js 对代码进行语法高亮》](https://juejin.cn/post/7088920558598881293)。

```js
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'
useEffect(() => {
  Prism.highlightAll()
}, [])
```

上面代码方法是在客户端渲染的，若要部署到线上，可以我们配合 `markdown-it` 实现在服务端代码高亮。

```js
import Markdown from 'markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'

const markdown = new Markdown({
  highlight: function (code, lang) {
    const html = Prism.highlight(code, Prism.languages.javascript)
    return `<pre class="language-${lang}">${html}</pre>`
  },
})
```

[代码片段](https://code.juejin.cn/pen/7129026081729806350)

## 小结

最后我们通过一个码上掘金在线运行例子来总结下本文的内容

[代码片段](https://code.juejin.cn/pen/7129160304239312904)

以上代码片段只实现了一个雏形，但 slidev 还有更强大的功能， 比如：演讲者录制、演讲者模型、绘图批注等，感兴趣的同学移步 [slidev](https://cn.sli.dev/) 官网和 Github。

如果对你有帮助，可以随手点个赞，这对我真的很重要。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
