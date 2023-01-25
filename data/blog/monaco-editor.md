---
title: 'VS code 使用的代码编辑器'
date: '2022/3/1'
lastmod: '2022/3/3'
tags: [Visual-Studio-Code]
draft: false
summary: 'monaco-editor 使用入门'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd86ebea36a4ea5af29c54db38f52d7~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

有时候我们会有在需要在网页中写代码或者改代码配置的需求，这个时候就需要用到代码编辑器，常规的代码编辑器有 `CodeMirror` 和 `Monaco Editor`，
CodeMirror 使用的人比较多，主要因为比较轻量，核心文件压缩后仅 70+ KB，根据所需要支持的语言按需打包，目前 CodeMirror 6 已经完全重构。它支持触摸屏并且极大地提高了库的可访问性。

另一个优秀的库就是 Monaco Editor，它比较重量级，但功能却十分优秀，本文主要介绍下 Monaco Editor 的用法。

## Monaco Editor 介绍

Monaco Editor 是 VS code 使用的编辑器，支持丰富的代码格式，拥有良好的可扩展性，支持代码并排对比编辑器，并且友好的支持视觉障碍人士，拥有语音播报功能，但 Monaco Editor 在移动 web 中却不支持。

![代码对比](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/754eed409d0746e1ad15d8ccd247aa20~tplv-k3u1fbpfcp-watermark.image?)

## 功能

对以下语言支持代码感知和验证

TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML

对以下语法支持代码高亮。

XML, PHP, C#, C++, Razor, Markdown, Diff, Java, VB, CoffeeScript, Handlebars, Batch, Pug, F#, Lua, Powershell, Python, Ruby, SASS, R, Objective-C

## 基本使用

1、 首先安装 monaco-editor

```bash
npm install monaco-editor
```

2、需要一个渲染编辑器的容器节点，我们设置是一个 id 为 container 的 div

```html
<div id="container" style="height: 100%"></div>
```

3、 在 js 文件中引入 monaco editor, 并创建编辑器

```js
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'

monaco.editor.create(document.getElementById('container'), {
  value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
})
```

打开浏览器，我们可以看到编辑器已经成功展示出来

![效果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61950ce06c8743d39699976d27b22eb0~tplv-k3u1fbpfcp-watermark.image?)

## 常规配置

我们可以在 create 的第二个参数传递一个 option 参数。

| 参数                | 说明                                                                                 | 类型            | 默认值            | 可选值                                                              |
| ------------------- | ------------------------------------------------------------------------------------ | --------------- | ----------------- | ------------------------------------------------------------------- |
| value               | 编辑器的初始值                                                                       | string          | \-                | \-                                                                  |
| theme               | 编辑器的主题样式,除了提供的可选值外，也可以通过 monaco.editor.defineTheme 自定义主题 | string          | 'vs'              | 'vs','vs-dark','hc-black'                                           |
| language            | 编辑器的初始语言,例如可以设置为 javascript, json 等                                  | string          | \-                | \-                                                                  |
| model               | 和编辑器关联的初始模型                                                               | ITextModel      | \-                | \-                                                                  |
| lineNumbers         | 控制行数的渲染，如果是 function，那么会使用 return 的内容作为行数展示                | string/Function | 'on'              | 'on','off','relative', 'interval', '(lineNumber: number) => string' |
| readOnly            | 控制编辑器是否只读                                                                   | boolean         | false             | \-                                                                  |
| autoClosingBrackets | 自动闭合括号                                                                         | string          | 'languageDefined' | 'always'/'languageDefined'/'beforeWhitespace'/'never'               |
| autoClosingOvertype | 自动闭合括号或引号                                                                   | string          | \-                | 'always'/'auto'/'never'                                             |
| autoClosingQuotes   | 自动闭合引号                                                                         | string          | 'languageDefined' | 'always'/'languageDefined'/'beforeWhitespace'/'never'               |
| autoIndent          | 自动缩进                                                                             | string          | 'advanced'        | 'none'/'keep'/'brackets'/'advanced'/'full'                          |

## 在 webpack 中使用

JS 代码

```js
import * as monaco from 'monaco-editor'

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js'
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.bundle.js'
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.bundle.js'
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js'
    }
    return './editor.worker.bundle.js'
  },
}

monaco.editor.create(document.getElementById('container'), {
  value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
  language: 'javascript',
})
```

然后需要在 webpack 入口添加配置

```js
module.exports = {
  mode: 'development',
  entry: {
    app: './index.js',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
    'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
}
```

上述加载方式是 ESM 的加载方式，默认情况下，monaco editor 附带的所有语言都将包含在内，如果你觉得这样配置麻烦，可以使用 `monaco-editor-webpack-plugin`，通过只选择特定的语言或者只选择特定的编辑器特性，这样可以用来生成一个更小的编辑器包。

修改 webpack.config.js ，在 languages 填写只包含支持的语言子集。

```js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['typescript', 'html', 'css'],
    }),
  ],
}
```

## 值获取

`editor.getValue()`

获取编辑器中的所有文本，并生成一个字符串返回，会保留所有信息（换行、缩进、注释等等）。

`editor.getSelection()`

获取编辑器中被选中文案的 range ，返回一个对象，如下：

```json
{
  "startLineNumber": 0,
  "startColumnNumber": 0,
  "endLineNumber": 0,
  "endColumnNumber": 0
}
```

## 自定义语言

monaco editor 还可以支持自定义语言，下面代码演示一个日志的编辑器

```js
//  注册一个语言
monaco.languages.register({ id: 'mySpecialLanguage' })

// 通过正则注册解析规则
monaco.languages.setMonarchTokensProvider('mySpecialLanguage', {
  tokenizer: {
    root: [
      [/\[error.*/, 'custom-error'],
      [/\[notice.*/, 'custom-notice'],
      [/\[info.*/, 'custom-info'],
      [/\[[a-zA-Z 0-9:]+\]/, 'custom-date'],
    ],
  },
})

// 定义仅包含与此语言匹配的规则的新主题
monaco.editor.defineTheme('myCoolTheme', {
  base: 'vs',
  inherit: false,
  rules: [
    { token: 'custom-info', foreground: '808080' },
    { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
    { token: 'custom-notice', foreground: 'FFA500' },
    { token: 'custom-date', foreground: '008800' },
  ],
  colors: {
    'editor.foreground': '#000000',
  },
})

// 注册新语言的代码提示
monaco.languages.registerCompletionItemProvider('mySpecialLanguage', {
  provideCompletionItems: () => {
    var suggestions = [
      {
        label: 'simpleText',
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: 'simpleText',
      },
      {
        label: 'testing',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'testing(${1:condition})',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'ifelse',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: ['if (${1:condition}) {', '\t$0', '} else {', '\t', '}'].join('\n'),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'If-Else Statement',
      },
    ]
    return { suggestions: suggestions }
  },
})

monaco.editor.create(document.getElementById('container'), {
  theme: 'myCoolTheme',
  value: getCode(),
  language: 'mySpecialLanguage',
})
```

**效果**

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d94488f8658c4827a4fa2c0d46852580~tplv-k3u1fbpfcp-watermark.image?)

通过这个例子，我们就可以在网页实现友好查看在线日志。

## 在 react 中使用

目前社区已经封装了 @monaco-editor/react， 而且不需要使用 webpack (或 rollup/parcel/etc)配置文件/插件。

```jsx
import React from 'react'

import Editor from '@monaco-editor/react'

function App() {
  return <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />
}

export default App
```

详情请参考仓库 [npm](https://www.npmjs.com/package/@monaco-editor/react)

## 应用

tailwindcss 的在线运行网站就 `https://play.tailwindcss.com/` 就是使用了 monaco-editor
并且拥有智能的语法提示，代码是开源的

![play.tailwindcss.com](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3842cbde10004531b64b1e08385f1837~tplv-k3u1fbpfcp-watermark.image?)

## 小结

本文简单介绍了下 monaco-editor，当然还有很多高级功能等待着我们去探索和挖掘， 文中罗列并不全面，深入挖掘请大家参考[官网](https://microsoft.github.io/monaco-editor/)和 [Github](https://github.com/microsoft/monaco-editor) ，希望在未来的开发中能够快速上手类似的代码编辑器实现。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
