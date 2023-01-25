---
title: '使用 PostCSS 插件让你的网站支持暗黑模式'
date: '2021/10/16'
lastmod: '2021/10/16'
tags: [JavaScript]
draft: false
summary: '最近公司需要给多个 webapp（大概20+）加上多皮肤的功能，原先默认是白色皮肤，我们先从暗黑模式入手，从而逐渐实现多皮肤功能。本篇记录下实现思路。'
images:
  [
    https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9de6b5fc1f804a88b6c6bb9025db04a0~tplv-k3u1fbpfcp-watermark.image?,
  ]
authors: ['default']
layout: PostLayout
---

最近公司需要给多个 webapp（大概 20+）加上**多皮肤**的功能，原先默认是白色皮肤，我们先从暗黑模式入手，从而逐渐实现多皮肤功能。本篇记录下实现思路。

## 换肤方案

### css variables

css variables 是 Web 标准实现了对深色模式的支持，
以下代码通过 CSS 媒体查询，最简单的实现。

```css
:root {
  color-scheme: light dark;
  background: white;
  color: black;
}

@media (prefers-color-scheme: dark) {
  :root {
    background: black;
    color: white;
  }
}
```

颜色较多的情况下，使用 css variables

```css
:root {
  color-scheme: light dark;
  --nav-bg-color: #f7f7f7;
  --content-bg-color: #ffffff;
  --font-color: rgba(0, 0, 0, 0.9);
}

@media (prefers-color-scheme: dark) {
  :root {
    --nav-bg-color: #2f2f2f;
    --content-bg-color: #2c2c2c;
    --font-color: rgba(255, 255, 255, 0.8);
  }
}

:root {
  color: var(--font-color);
}

.header {
  background-color: var(--nav-bg-color);
}

.content {
  background-color: var(--content-bg-color);
}
```

优点：代码量最少，实现起来方便；

缺点：存在浏览器兼容性，需要 edge16+ 才支持，老项目实现起来， 需要重构 css， 所以对我司来说就不适用了，如果是新的 webapp，我会毫不犹豫的选择这种方式。

### less 在线编译

这种方案最典型的例子是 https://antdtheme.com/ ，通过`less modifyVars`方法
启用对较少变量的运行时修改。使用新值调用时，将重新编译较少的文件，而无需重新加载。

```html
<script src="less.js"></script>
<script>
  less.modifyVars({ '@text-color': '#fff', '@bg-color': '#000' })
</script>
```

那如果要修改的颜色变量过多，或者样式文件过多，就会造成切换的时候卡顿。

### 打包多份 css

当然也可以手动打包 2 份 css 样式

```
var less = require("less");
var fs = require("fs");

fs.readFile("./index.less", "utf-8", (err, str) => {
  less.render(
    str,
    {
      paths: [".", "./componnents"], //  为 @import指令指定搜索路径
      compress: true, // 压缩
      modifyVars: {
        "@text-color": "#fff",
        "@bg-color": "#000",
      },
    },
    function (e, output) {
      console.log(output.css);
    }
  );
});
```

然后就可以通过动态插入 css 的方式进行换肤了

```js
function changeTheme(theme) {
  const styleCss = document.querySelector('#styleCss')
  if (styleCss) {
    styleCss.href = `/assets/css/${theme}.css`
  } else {
    const head = document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    link.id = 'styleCss'
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.dataset.type = 'theme'
    link.href = `/assets/css/${theme}.css`
    head.appendChild(link)
  }
  localStorage.setItem('theme', theme)
}
```

这种方式存在一个问题，当点击切换的时候会引起整个页面重排，因此我们需要单独打包出只包含颜色的样式文件。从这个思路出发，我们就接触到了 postcss.

## PostCSS

PostCSS 核心包含一个解析器，该解析器生成一个 CSS AST (抽象语法树) ，这是一个解析 CSS 字符串的节点树的表示。当我们在 CSS 抽象语法树中修改一些内容后，PostCSS 将语法树（AST）生成回 CSS 字符串。

核心就是 **编译->转换-->生成** 是不是跟 babel 相似呢？

大家都知道 https://astexplorer.net/ 这个网站，可以用来写 babel 插件，不知道是否使用过其他解析器？这边选择 CSS 和 postcss 这样就可以将 css 解析成 CSS AST (抽象语法树)了。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b918ce81bcab408bbbd6d994ada692a7~tplv-k3u1fbpfcp-watermark.image?)

### 目的

![carbon (1).png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7841fc4556324ec8a205b7079f19cb42~tplv-k3u1fbpfcp-watermark.image?)

当前我有一份 less 样式和 2 份颜色变量，我需要生成如下样式:

![carbon.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e20a51a5425340a0b1557609d2def199~tplv-k3u1fbpfcp-watermark.image?)

这样我就可以在 html 跟节点 添加和删除 `dark` 这个样式来实现换肤了。

或许有同学会问，这里怎么突然变成 less 了？PostCSS 能解析 Less 吗？ 答案是不能。
当前假设我们的 webapp 是基于 webpack 构建的。

```js
module: {
  rules: [
    //...
    {
      test: /\.less$/i,
      use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
    },
    //...
  ]
}
```

上面的 loader 的执行顺序是 自右向左 👈 ，less 经过 less-loader 处理后，会变成 css， 所以 postcss-plugin 可以用于其他任意 css 预处理器。

### 开始写一个 PostCSS 插件

我们可以使用 [postcss-plugin-boilerplate](https://github.com/postcss/postcss-plugin-boilerplate) 这个脚手架来创建一个 postcss-plugin ，它还配置好了 jest 单元测试。通过几个简单命令就可以创建一个 postcss-plugin 工程。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ba9650d3ee843f693948348f4c623d3~tplv-k3u1fbpfcp-zoom-1.image)

当然我们可以直接再工程目录下创建一个 js 文件

```js
// test-plugin.js
var postcss = require('postcss')

module.exports = postcss.plugin('pluginname', function (opts) {
  opts = opts || {} // plugin 参数
  return function (root, result) {
    // root 是转换后的 CSS AST
  }
})
```

然后在 `postcss.config.js`引入就可以了

```js
module.exports = {
  plugins: [require('./test-plugin'), require('autoprefixer')],
}
```

### PostCSS plugin Hello world

编写一个反转 css 属性值的插件

```js
var postcss = require('postcss')

module.exports = postcss.plugin('postcss-backwards', function (opts) {
  opts = opts || {}
  return function (root, result) {
    // 遍历所有样式节点
    root.walkDecls((declaration) => {
      declaration.value = declaration.value.split('').reverse().join('')
    })
  }
})
```

当然这个插件，没有实际意义，我们只是通过它来学习如何编写 postcss 插件

## 多皮肤插件

### 使用

**JS 入口引入 2 份样式文件**

```js
import './default-theme.less'
import './dark-theme.less'
```

**component.less**

```
.box{
  width: 100px;
  height: 100px;
  border: 1px solid @border;
  background-color: @bg;
  color: @color;
}
```

**default-theme.less**

```
@import "./component";

@border: #333;
@color: #000;
@bg: #fff;
```

**dark-theme.less**

```
@import "./component";

@border: #999;
@color: #fff;
@bg: #000;
```

**生成 css**

```css
.box {
  width: 100px;
  height: 100px;
  border: 1px solid #333;
  background-color: #fff;
  color: #000;
}
.dark .box {
  border: 1px solid #999;
  background-color: #000;
  color: #fff;
}
```

### 源码

```js
function isEmpty(arr) {
  return Array.isArray(arr) && arr.length === 0
}

const hasColorProp = (colorProps, declProp) => colorProps.some((prop) => declProp.includes(prop))

module.exports = (opts = {}) => {
  if (!opts.colorProps) {
    opts.colorProps = ['color', 'background', 'border', 'box-shadow', 'stroke']
  }
  return (root) => {
    let theme
    const file = root.source.input.file || ''

    const matched = file.match(/(?<theme>[a-zA-Z0-9]+)-theme.(less|css|scss|sass)/)
    if (matched && matched.groups.theme !== 'default') {
      theme = matched.groups.theme
    } else {
      if (process.env.NODE_ENV == 'test') {
        theme = 'test'
      }
    }
    if (theme) {
      root.walkRules((rule) => {
        rule.walkDecls((decl) => {
          if (!hasColorProp(opts.colorProps, decl.prop)) {
            decl.remove()
          }
        })

        if (isEmpty(rule.nodes)) {
          rule.remove()
        } else {
          rule.selector = rule.selector
            .replace(/\n/g, '')
            .split(',')
            .map((s) => `.${theme} ${s}`)
            .join(',\n')
        }
      })
    }
  }
}
```

### 实现

1、通过文件名判断是否是需要生成皮肤样式

```js
const file = root.source.input.file || ''

const matched = file.match(/(?<theme>[a-zA-Z0-9]+)-theme.(less|css|scss|sass)/)
```

2、删除不包含颜色的样式，保留 `border-color background-color` 等包含颜色的样式

`["color", "background","border","box-shadow","stroke",]`

3、如果这个 css 选择器中， 没有 css 属性，就删除这个选择器

4、在 css 选择器前面加上 `.theme`样式名称

## 老项目升级

原来的项目中可能没有区分颜色变量到单独的样式文件中，在样式中可能写了颜色绝对值。

是否可以写一个工具帮我们来升级呢？

20+项目是否可以写一个工具自动转换一下？

这个时候正好有一个库帮助了我们，[postcss-less](https://github.com/shellscape/postcss-less) 可以帮我们将 less 转为 AST ，然后我们可以配置一下规则将 **颜色替换成变量**

### 配置规则

```js
module.exports = [
  {
    prop: ['background-color', 'background'],
    from: ['#fff', '#ffffff', '@white'],
    to: '@component-background',
  },
  {
    prop: ['border', 'border-color'],
    from: ['#D3D9E4', '#D3D9E2'],
    to: '@border-color',
  },
  {
    prop: ['color'],
    from: ['#666E79', '#5C6268'],
    to: '@text-color',
  },
]
```

### 转换

```js
const syntax = require('postcss-less')
var fs = require('fs')
const path = require('path')
const rules = require('./rule.js')

var glob = require('glob')

function log(file, node, to) {
  console.log(
    '\x1b[32m',
    `convert ${file} ${node.source.start.line}:${node.source.start.column}  ${node.parent.selector} ${node.prop} from ${node.value} to ${to}`
  )
}

let codes = {}

// options is optional
glob('./src/**/*.less', function (er, files) {
  files.forEach((file) => {
    var ast = syntax.parse(file)

    // traverse AST and modify it
    ast.walkDecls(function (node) {
      rules.forEach((item) => {
        if (item.prop.includes(node.prop) && item.from.includes(node.value)) {
          node.value = item.to
          log(file, node, item.to)
        }
      })
    })
    fs.writeFileSync(path.resolve(file), syntax.nodeToString(ast))
  })
})
```

### 主要步骤

1、通过 glob 读取所有的 less 文件

2、通过 postcss-less 将 less 转换为 AST

3、遍历所有 css 属性，判断在规则中就替换为 less 变量

4、转换成 less 写文件

当然上述代码是最简易的，还有很多样式没有覆盖

比如： border 可以写 border-color 等等

### 通过 VSCODE 正则查询遗漏颜色

当上述规则不能覆盖所有项目时，开发者可以在 VSCODE 中输入正则（`(#[a-fA-F0-9]{3})|(#[a-fA-F0-9]{6})|^rgb`） 找出代码中的颜色，再一一提取成 less 变量。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b24aaf308bb54a618fdfe18c039b0d46~tplv-k3u1fbpfcp-watermark.image?)

## 小结

1、本篇总结了前端换肤的几种常用方式，通过最对比发现通过 PostCSS 生成皮肤样式在我们的项目中最为方便，也最容易让你的网站支持暗黑模式，我将 [postcss-multiple-themes](https://github.com/maqi1520/postcss-multiple-themes) 这款插件开源到 github 并且发布了 [npm 包](https://www.npmjs.com/package/postcss-multiple-themes)

2、在通过 PostCSS 思考如何将老项目中的 css 颜色替换成变量，当项目较多时，一定程度上也节省了人力成本。

**最后**

如果大家也在给 webapp 做换肤工作，被前端**多皮肤**的问题困扰，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
