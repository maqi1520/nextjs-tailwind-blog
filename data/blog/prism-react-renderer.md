---
title: '使用 Prism.js 对代码进行语法高亮'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '通常我们在开发博客网站或者技术社区（类似掘金）这类网站的时候，就会有需求“对代码进行语法高亮”，本文主要记录笔者在开发的时候遇到的问题以及解决方案。'
images: []
authors: ['default']
layout: PostLayout
---

## 前言

通常我们在开发博客网站或者技术社区（类似掘金）这类网站的时候，就会有需求“对代码进行语法高亮”，我在开发 [mdx editor](https://editor.runjs.cool/ '微信排版编辑器')（微信排版编辑器） 的时候，也有这个功能。

社区对应语法高亮比较流行的有 `highlight.js` 和 `Prism.js`。`Prism.js` 使用非常简单，只需要引一行`<script>`就可以对文档中的代码进行高亮， 然而，它有一个比较严重的问题。文档虽然简单，而我的项目是 React 项目，当想要增加一种语法高亮就会变得有些麻烦了，下面介绍下我的实现方式。

## Prism.js 的使用

通过官网可以下载页面进行配置，并且下载对应的 js 和 css

![下载配置](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b690fb22cb74e478b943ff01976da2a~tplv-k3u1fbpfcp-zoom-1.image)

可以看到 prism.js 非常轻量。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="prism.css" rel="stylesheet" />
  </head>
  <body>
    <pre><code class="language-css">p { color: red }</code></pre>
    <script>
      window.Prism = window.Prism || {}
      window.Prism.manual = false
    </script>
    <script src="prism.js"></script>
  </body>
</html>
```

只需要引入 prism.js 和 prism.css 就会对文档中的 `code` 代码块进行高亮，`code` 代码需要使用`language-`前缀，代码块需要使用 `<pre>` 标签，行内代码可以直接使用 `<code class="language-css">`就可以， prism.js 会在`DOMContentLoaded` 的时候，自动触发，对代码进行高亮.

如果我们的内容是异步加载的，这块时候就需要设置手动执行

```html
<script src="prism.js" data-manual></script>
```

或者

```html
<script>
  window.Prism = window.Prism || {}
  window.Prism.manual = true
</script>
<script src="prism.js"></script>
```

## 在 react 中使用

首先我们可以安装

```bash
npm install --save prismjs
# 或者
yarn add prismjs
```

我们可以从 prism js 包中手动加载这些资源，但问题是 webpack 会将所有语言的支持都进行打包。如果只使用所提供几种语言支持，那么这可能会影响最终整个 bandle js 的大小。接下来我们需要做的是添加一个 babel 插件，负责加载对 Prism.js 的 CSS 和语言支持。

使用 npm 安装这个 babel 插件

```bash
npm install --save-dev babel-plugin-prismjs
# 或者
yarn add --dev babel-plugin-prismjs
```

然后在 .bablerc 配置需要支持的语言和插件

```json
{
  "plugins": [
    [
      "prismjs",
      {
        "languages": ["javascript", "css", "html"],
        "plugins": ["line-numbers", "show-language"],
        "theme": "okaidia",
        "css": true
      }
    ]
  ]
}
```

我们可以指定使用哪些主题和插件，以及支持哪些语言。babel 将自动添加的插件以及所需的 CSS 。如果将 CSS 设置为 true，请先确保已经配置了 css-loader，能够支持 `import css`。

## 实现 react 组件

我们使用 hooks 来实现一个组件

```jsx
import React, { useRef, useEffect } from 'react'

function PrismCode({ code, language, plugins = [] }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref && ref.current) {
      Prism.highlightElement(ref.current)
    }
  }, [code])

  return (
    <pre className={plugins.join(' ')}>
      <code ref={ref} className={`prism-code language-${language}`}>
        {code}
      </code>
    </pre>
  )
}
```

上面代码中 `Prism.highlightElement` 对当前代码中的 code 进行高亮。

**使用**

```jsx
import React from 'react'
import { PrismCode } from './component'
const code = `
const foo = 'foo';
const bar = 'bar';
console.log(foo + bar);
`
const Example = () => <PrismCode code={code} language="js" plugins={['line-numbers']} />
```

很简单，只需要指定插件和语言， 就可以对代码进行语法高亮了。

[代码片段](https://code.juejin.cn/pen/7088571524470276126)

## 高级技巧

我们知道 react 是采用虚拟 dom，通过虚拟 dom 的 diff 对比，将 dom 中修改的部分提交更新到页面上。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac34a623feb94bf2950683b5c1f906f5~tplv-k3u1fbpfcp-zoom-1.image)

如果使用上面的组件，我们页面中的 code 是实时编辑的，那么整个代码块都会重新渲染，因为 Prism.js 库修改了 DOM，导致 React 丢失了标记，这就失去了使用 react 虚拟 DOM 的优势。

如果你也遇到这些问题，则需要使用 `Prism.tokenise` API。 这个函数是 Prism.js 底层用来为突出显示的代码部分构建 HTML 的。 关于这个函数的更多信息请查看[官网](https://prismjs.com/index.html)

使用这个函数，可以在 React 组件中突出显示的代码标记。 这样，React 可以正确地跟踪 DOM 并且不会遇到任何错误。

## prism-react-renderer

让人高兴的是社区已经有一个组件 [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) 帮我们封装好了 `Prism.tokenise` API，当我们修改 code 的时候，不会让整个组件的 DOM 更新。

安装

```bash
# npm
npm install --save prism-react-renderer
# yarn
yarn add prism-react-renderer
```

使用

```jsx
import React from "react";
import { render } from "react-dom";
import Highlight, { defaultProps } from "prism-react-renderer";

const exampleCode = `
(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;
`;

render((
  <Highlight {...defaultProps} code={exampleCode} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>,
  document.getElementById('root')
);
```

同样也支持自定义语言和皮肤。

## 代码行高亮

我在[mdx editor](https://editor.runjs.cool/) 中也使用了 prism-react-renderer，当我把代码开源后，本以为完成了这个功能， 在这里感谢`@蓝色的秋风` 提的 [issues](https://github.com/maqi1520/mdx-editor/issues/5)，就是要支持代码行高亮。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e625a117b4f1405fb2150bef8fe1b741~tplv-k3u1fbpfcp-zoom-1.image)

其实 Prism.js 本来就支持[diff-highlight](https://prismjs.com/plugins/diff-highlight/)， 但我使用的 prism-react-renderer，还没支持，官方还有个 [issues](https://github.com/FormidableLabs/prism-react-renderer/issues/90) 没有 close，总不能等官方实现这个功能在来实现吧？接下来就得自己实现了。

```js
const isDiff = language.startsWith('diff-')

let highlightStyle = []

let code = children
if (isDiff) {
  code = []
  language = language.substr(5)
  highlightStyle = children.split('\n').map((line) => {
    if (line.startsWith('+')) {
      code.push(line.substr(1))
      return 'inserted'
    }
    if (line.startsWith('-')) {
      code.push(line.substr(1))
      return 'deleted'
    }
    code.push(line)
  })
  code = code.join('\n')
}
```

主要方式是通过判断每一行的第一个字符是否是 `+`或`-`，对应在遍历代码的是加上高亮的样式。

## 使用

在语法前面加 `diff-` 比如 `diff-js`、`diff-jsx`, `diff-ts`，代码前面可以加 `+`,`-`，就可以高亮代码了。

**效果**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c433188baaa4834a294347b758268c0~tplv-k3u1fbpfcp-zoom-1.image)

这里我就不贴代码了，感兴趣的小伙伴可以移步 github [查看源码](https://github.com/maqi1520/mdx-editor/blob/main/src/components/MDX/CodeBlock.jsx 'github 源码')

---

推荐下我的开源程序

- https://editor.runjs.cool/ MDX 排版编辑器

若对你有帮助记得点个 star，感谢！

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/prism-react-renderer)
