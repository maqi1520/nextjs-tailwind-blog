---
title: 'React 新的文档用到了哪些技术？'
date: '2022/1/13'
lastmod: '2022/1/14'
tags: [前端, React.js]
draft: false
summary: '前言 https://beta.reactjs.org React 的新的文档已经 完成了 70 % 并且呼吁社区进行翻译工作。 新的文档采用了全新的架构 next.js + Tailwind CSS'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2329fe492f434715986045e153446e26~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

https://beta.reactjs.org React 的新的文档已经 完成了 70 % 并且呼吁社区进行翻译工作。

![2022-01-13 19-03-51.2022-01-13 19_05_34.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6bf9840de05e487396f7de037dfd1428~tplv-k3u1fbpfcp-watermark.image?)
新的文档采用了全新的架构 `next.js` +` Tailwind CSS` ,改版后的文档界面有种焕然一新的感觉，支持暗黑模式，我们可以在线学习，并且写代码，采用了这种所见即所得的形式，大大降低了学习者的成本，我也被这种形式所深深吸引，那么这种所见即所得的形式是如何实现的呢？

## 基本介绍

新文档地址在 https://github.com/reactjs/reactjs.org/ 中的 beta 目录下，外层代码是目前的文档代码，那么我们可以直接 `git clone` 并且拷贝 beta 目录下的内容

这里面有 `yarn.lock` 文件，跟绝大多数 next 项目一样 `yarn install` 之后，运行 `yarn dev` 就可以运行开发环境

![s16501401132022](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8270cf7dea684a689dc07958cfcf15ca~tplv-k3u1fbpfcp-zoom-1.image)

启动速度非常快，仅仅 3.3s， 打开 http://localhost:3000，此时 `next.js` 会再次编译，大概 **200ms**，这种优势得益于 next.js 按需编译的优势，也就是是说当前启动的时候，并不会全站打包，而是当进入某个页面的时候编译当前页面，所以速度相当快。

## 约定式路由

![s16384301132022](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/471386dece394fa8928d4bfb211cff06~tplv-k3u1fbpfcp-zoom-1.image)
next 是约定式路由，在 pages 文件夹下的目录默认生成路由，即
'/src/pages/learn/add-react-to-a-website.md' 生成路由 `/learn/add-react-to-a-website`

此时发现里面的文档都是`.md`后缀的 Markdown 文件，那么 markdown 也可以写交互功能了吗？
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/332cbf27c8e84b29ac23950ed38e1084~tplv-k3u1fbpfcp-watermark.image?)

打开 index.md，我们发现里面的代码不仅仅是 markdown 还有 react 组件，那么 `<HomepageHero />` 这个组件是如何被解析成 react 组件的？

## next 支持 Markdown

首先 `next.js` 是不支持 `Markdown` 的，我们需要让 `next.js` 支持 `Markdown`， 我们打开 `next.js` 的配置文件 `next.config.js`,

```js
pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
```

先让 next 支持 md、 mdx 格式，接下来我们来看下 webpack 部分的配置

```js
webpack: (config, {dev, isServer, ...options}) => {
    if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: options.isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
        );
    }

    // Add our custom markdown loader in order to support frontmatter
    // and layout
    config.module.rules.push({
        test: /.mdx?$/, // load both .md and .mdx files
        use: [
        options.defaultLoaders.babel,
        {
            loader: '@mdx-js/loader',
            options: {
            remarkPlugins,
            },
        },
        path.join(__dirname, './plugins/md-layout-loader'),
        ],
    });

    return config;
},
```

首先是单独安装了 `webpack-bundle-analyzer` 这个是打包分析插件，通过 `ANALYZE=true next build` 就可以生成分析包含哪些模块包的网页

![s16585001132022](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12604e7fdfe64897b5dc750e1e075dec~tplv-k3u1fbpfcp-zoom-1.image)
next.js 的分包也非常完美，每个 js 大小都差不多，并且根据页面按需加载。
下面配置是解析 markdown 的，只要是 md、mdx 都会走 `@mdx-js/loader`， 就是这个 `@mdx-js/loader` 让 markdown 支持 jsx 了。

这里面还加了一个自定义 loader

```js
module.exports = async function (src) {
  const callback = this.async()
  const { content, data } = fm(src)
  const pageParentDir = path
    .dirname(path.relative('./src/pages', this.resourcePath))
    .split(path.sep)
    .shift()
  const layoutMap = {
    blog: 'Post',
    learn: 'Learn',
    reference: 'API',
  }
  const layout = layoutMap[pageParentDir] || 'Home'

  const code =
    `import withLayout from 'components/Layout/Layout${layout}';

export default withLayout(${JSON.stringify(data)})


` + content

  return callback(null, code)
}
```

通过判断父级目录自动增加 Layout，有了 layout，结构就出来了，所以 webpack 的 loader 就是一个函数，可以直接修改代码。

## MDX

[MDX](https://mdxjs.com/docs/using-mdx/#mdx-provider) 让 markdown 支持 jsx，我们一起来看看如何使用

```jsx
import React from 'react'
import ReactDom from 'react-dom'
import Post from './post.mdx'
import { Heading, /* … */ Table } from './components/index.js'

const components = {
  h1: Heading.H1,
  // …
  table: Table,
}

ReactDom.render(<Post components={components} />, document.querySelector('#root'))
```

在 components 传入自定义组件，在 markdown 中就可以使用了。 也可以改成嵌套模式：

```jsx
import React from 'react'
import ReactDom from 'react-dom'
import Post from './post.mdx'
import { Heading, /* … */ Table } from './components/index.js'
import { MDXProvider } from '@mdx-js/react'

const components = {
  h1: Heading.H1,
  // …
  table: Table,
}

ReactDom.render(
  <MDXProvider components={components}>
    <Post />
  </MDXProvider>,
  document.querySelector('#root')
)
```

### 在线沙箱

文档中还有一种写法, 可以直接再网页中渲染一个 https://codesandbox.io/

并且文件可以引用文件，这就比较你牛了

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/47f4e72707dc4857bd2159567b25dbd3~tplv-k3u1fbpfcp-watermark.image?)

![s18303801132022](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2ffc9c88a9e427d9e5f50ed1530b731~tplv-k3u1fbpfcp-zoom-1.image)

我们发现 Sandpack 里面使用了 "@codesandbox/sandpack-react" 这个包，
打开 https://sandpack.codesandbox.io/ 官网，非常酷炫的效果映入眼帘

简单几个配置就可以渲染出在线代码编辑器

```jsx
<Sandpack
  customSetup={{
    dependencies: {
      'react-markdown': 'latest',
    },
    files: {
      '/App.js': `import ReactMarkdown from 'react-markdown' 

export default function App() {
  return (
    <ReactMarkdown>
      # Hello, *world*!
    </ReactMarkdown>
  )
}`,
    },
  }}
/>
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff184f09b6a14fc69350e42e7bbfdd11~tplv-k3u1fbpfcp-watermark.image?)

## 小结

1、React 新文档的架构我很喜欢，代码和目录也非常清晰，非常适合阅读

2、我们一些组件库文档是否可以往 next 架构迁移？

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
