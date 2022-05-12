---
title: '实现一个 Code Pen：（二）在 Next.js 中使用 Monaco Editor'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: 'Monaco Editor 是 VS Code 中使用的开源代码编辑器， 拥有代码高亮和代码自动补全的功能，本文介绍 Monaco Editor 的加载方式和 React 组件封装'
images: []
authors: ['default']
layout: PostLayout
---

Monaco Editor 是 VS Code 中使用的开源代码编辑器， 拥有代码高亮和代码自动补全的功能，Monaco Editor 支持的语言有很多，所以使用的时候不需要将全部语言都支持，我们只需要按需加载需要支持的语言就可以了，过官网的例子我们知道 Monaco Editor 有 2 种加载方式，分别是 amd 和 esm，也就是 Requirejs 和 ES Modules。

## AMD 的方式加载

```html
<h2>Monaco Editor Sample</h2>
<div id="container" style="width: 800px; height: 600px; border: 1px solid grey"></div>

<!-- 也可以换成 requirejs -->
<script src="../node_modules/monaco-editor/min/vs/loader.js"></script>
<script>
  require.config({ paths: { vs: '../node_modules/monaco-editor/min/vs' } })

  require(['vs/editor/editor.main'], function () {
    var editor = monaco.editor.create(document.getElementById('container'), {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      language: 'javascript',
    })
  })
</script>
```

很简单，只需要一个 DOM ID，通过 `monaco.editor.create` 创建一个编辑器就可以了。

## ESM 的方式加载

现代浏览器目前都支持 ES Modules，所以兼容性方面我们不考虑了，使用 ESM 的方式来加载是主流的选择。

- 首先提供一个定义 worker 路径的全局变量，选择对应的文件后缀来加载 language 的 work 文件，monaco 会去调用 `getWorkerUrl` 去查 worker 的路径，然后去加载。默认会加载一个 `editor.worker.js`，这是一个基础功能文件，提供了所有语言通用的功能（例如已定义常量的代码补全提示），无论使用什么语言，monaco 都会去加载它。

下面是示例代码

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

- 其次需要在 webpack 中配置 worker 文件的打包入口，因为是 web worker ，所以输出的 `globalObject` 的类型应该是 `self`

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

Monaco 的实现采用 worker 的方式，因为语法解析需要耗费大量时间，所以用 worker 来异步处理返回结果比较高效。

采用`import * as monaco from 'monaco-editor';`这种方式引入的话，会自动带上所有的内置语言和控件，唯一的缺点就是包的体积过大。

![打包后的 chunk 文件 ](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d7aaf01e7b24eb682fecf368ea00f2c~tplv-k3u1fbpfcp-zoom-1.image)

看了下 webpack 打包出了所有的 chunk js，这些语言是我们不需要的，我们只需要加载所需要的语言 JS 就可以了，因此需要优化 js 文件大小。

## 优化包大小

需要将全部引入的方式替换为编辑器的核心 api

```js
- import * as monaco from 'monaco-editor';
+ import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

monaco.editor.create(document.getElementById('container'), {
	value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
	language: 'javascript'
});
```

这的基础上，编辑器是无法高亮 JavaScript 和代码自动补全的，还需要提供 JavaScript 扩展文件。

```js
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
```

如果想要编辑支持全局查找的功能

![monaco 查找功能](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eacea4775686491ea59ddf4bbac6ed26~tplv-k3u1fbpfcp-zoom-1.image)

就需要引入以下代码

```js
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
```

## 使用 webpack-plugin

这样配置是否很麻烦？ 我们可以使用 `monaco-editor-webpack-plugin`， 让 webpack 插件帮我们，自动引入。

```js
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV,
	entry: './index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [
		new MonacoWebpackPlugin({
			languages: ['typescript', 'javascript', 'css'],
			features:["coreCommands","find"]
            filename: "static/[name].worker.js",
		})
	]
};
```

插件会帮我们做这么几件事

- 自动注入 getWorkerUrl 全局变量
- 处理 worker 的编译配置
- 自动引入控件和语言包。

**参数说明**

- filename (string) - 自定义文件后缀需要加载的 worker scripts，默认值是: '[name].worker.js'。
- languages (string[]) - 编辑器需要支持的语言，默认值是全部语言。
- features (string[]) - 编辑器需要支持的控件，默认值是全部控件。

## 在 Next.js 中加载 Monaco Editor

由于 next.js 加载全局 css 文件只能在 `src/pages/_app` 中引入，但 monaco-editor，加载 css 是在包引入的，因此我们需要在 webpack 加载 css 的时候设置允许 `node_modules` 下的 `monaco-editor` 文件

下面是完整的 `next.config.js` 文件配置

```js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path')

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, webpack, dev }) => {
    config.module.rules
      .filter((rule) => rule.oneOf)
      .forEach((rule) => {
        rule.oneOf.forEach((r) => {
          if (
            r.issuer &&
            r.issuer.and &&
            r.issuer.and.length === 1 &&
            r.issuer.and[0].source &&
            r.issuer.and[0].source.replace(/\\/g, '') ===
              path.resolve(process.cwd(), 'src/pages/_app')
          ) {
            r.issuer.or = [...r.issuer.and, /[\\/]node_modules[\\/]monaco-editor[\\/]/]
            delete r.issuer.and
          }
        })
      })

    config.output.globalObject = 'self'
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: [
            'json',
            'markdown',
            'css',
            'typescript',
            'javascript',
            'html',
            'scss',
            'less',
          ],
          filename: 'static/[name].worker.js',
        })
      )
    }
    return config
  },
}
```

## 将 monaco-editor 封装一个 react 组件

```js
import React, { useRef, useEffect, useCallback } from 'react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const languageToMode = {
  html: 'html',
  css: 'css',
  less: 'less',
  sass: 'sass',
  javascript: 'javascript',
  babel: 'javascript',
  typescript: 'typescript',
}

const Editor = ({ language, defaultValue, value, onChange }) => {
  const divEl = useRef(null)
  const editor = useRef(null)

  useEffect(() => {
    if (divEl.current) {
      editor.current = monaco.editor.create(divEl.current, {
        minimap: { enabled: false },
        theme: 'vs-dark',
      })
      editor.current.onDidChangeModelContent(() => {
        onChange(editor.current.getValue())
      })
    }

    setupKeybindings(editor.current)

    return () => {
      editor.current.dispose()
    }
  }, [])

  useEffect(() => {
    const model = editor.current.getModel()
    monaco.editor.setModelLanguage(model, languageToMode[language])
  }, [language])

  useEffect(() => {
    if (defaultValue) {
      editor.current.setValue(defaultValue)
    }
  }, [])

  useEffect(() => {
    if (value) {
      editor.current.setValue(value)
    }
  }, [value])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      window.setTimeout(() => editor.current.layout(), 0)
    })
    observer.observe(divEl.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  return <div className="relative flex-auto" ref={divEl}></div>
}

export default Editor
```

编辑器接收 3 个参数 `language`、`value`、`onChange` 改变代码的时候回调

使用 `ResizeObserver` 监听当前 div 的大小，调用`editor.layout()`方法让编辑器自适应。

细心的朋友应该还会发现一个很奇怪的地方，那就是我们绑定的方法用的是 `onDidChangeModelContent`，里面有一个 Model，那么整个 Moel 是哪来的呢？默认情况下，monaco 会帮我生成一个 Model，我们可以调用 getModel 打印一下

![monaco model](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6de223785b27498188daf8ed5948696d~tplv-k3u1fbpfcp-zoom-1.image)

我们可以发现，Model 其实是一个保存编辑状态的对象，里面含有语言信息，当前的编辑文本信息，标注信息等。所以我们可以缓存一下 Model 对象，在需要的时候直接调用 setModel 即可随时切换到之前的状态。或者也可以在初始化实例的时候设置一个 Model。

```js
const model=monaco.editor.createModel("console.log(1)","javascript",monaco.Uri.file("file.js"););
monacoInstance = monaco.editor.create(divEl.current, {
 model:model
})
```

在 model 上也可以绑定事件

```js
model.onDidChangeContent((event)=>{
...
})
```

Model 最后也需要销毁，这里分两种情况，假如是通过 createModel 创建的 Model，那么我们需要手动销毁，但是如果是 monaco 默认创建的，则不需要，在调用实例的销毁方法时，会顺带销毁默认创建的 Model。

```js
model.dispose()
```

编辑器支持 TSX

默认情况下，monaco 是不支持 tsx 的，如果需要支持 tsx，则需要创建一个 model

```js
export function setupTsxMode(content) {
  const modelUri = monaco.Uri.file('index.tsx')
  const codeModel = monaco.editor.createModel(content || '', 'typescript', modelUri)

  //  设置typescript 使用jsx 的编译方式
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: 'react',
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })
  return codeModel
}
```

在简单的场景下，Model 的存在可能使得我们使用起来比较繁琐，但是，在复杂场景下，model 可以极大的简化代码复杂性。

设想一下我们有 5 个 tab，每个 tab 都是一个编辑器，每个编辑器都有各自的语言，内容和标注信息，如果没有 Model，我们需要保存每个 tab 的语言，内容等信息，在切换到对应 tab 时再将这些信息初始化到编辑器上，但是利用 Model，我们不需要额外去保存每个 tab 的编辑信息，只需要保存每个 tab 的 Model，然后将 Model 传给编辑器进行初始化即可。

至此编辑器封装成功，看下使用效果

![code效果截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8535e049a3ac48eb9f33ebb281a60e0d~tplv-k3u1fbpfcp-zoom-1.image)

预览地址：https://code.runjs.cool/pen/create

代码仓库：https://github.com/maqi1520/next-code-pen

## 小结

通过本文我们了解了

- Monaco Editor 的加载方式
- Monaco Editor 在 webpack 和 next.js 中的配置
- 封装了一个最基本的 React Monaco Editor

关于 Monaco Editor 的配置请参考[官网](https://microsoft.github.io/monaco-editor/api/index.html)和[Github](https://github.com/microsoft/monaco-editor)

**参考**

[闲谈 Monaco Editor-基本使用](https://zhuanlan.zhihu.com/p/47746336 '闲谈 Monaco Editor')

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
