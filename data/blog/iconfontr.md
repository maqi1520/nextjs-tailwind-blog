---
title: '【油猴脚本】在 Iconfont 上直接复制 React component 代码'
date: '2022/7/22'
lastmod: '2022/7/22'
tags: [JavaScript, React.js]
draft: false
summary: '所以我写了一个油猴脚本，可以在 iconfont.cn 上直接复制 React component 代码，本文讲述改脚本的实现原理。'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a6b0cf5711a4ca0b9a9bb16f0689cb1~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

本文接上一篇[《如何在项目中管理你的图标？》](https://juejin.cn/post/7114589614186168350 'https://juejin.cn/post/7114589614186168350')

## Iconfont 和 SVG 优缺点对比

在上文中介绍了使用 iconfont 的缺点，以及使用 SVG 的优点，简单归纳为以下几点：

**Icon 的缺点**

- 当网络不好的时候，会显示方块
- 如只使用一个图标，字体冗余
- 维护依赖 iconfont 平台
- 在组件开发的时候命名冲突

**使用 SVG 的优点**

- 完全离线化使用，不需要从 CDN 下载字体文件，图标不会因为网络问题呈现方块，也无需字体文件本地部署。
- 在低端设备上 SVG 有更好的清晰度。
- 支持多色图标。
- SVG 可以支持动画

并给出了最终方案，放弃使用字体，使用 SVG 代替 iconfont。

又给出了实践步骤:

- 老项目中的 iconfont， 可以通过 nodejs 脚本将下载的 `iconfont.svg` 转为多个 SVG 图标
- 新加的图标，可以直接在 iconfont.cn 上下载 SVG
- React 项目中，如果要直接使用 SVG，需要配置 webpack loader —— [@svgr/webpack](https://react-svgr.com/docs/webpack/ 'https://react-svgr.com/docs/webpack/')

下面是 `webpack.config.js` 中要加入的配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.SVG$/i,
        type: 'asset',
        resourceQuery: /url/, // *.SVG?url
      },
      {
        test: /\.SVG$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.SVG?url
        use: ['@SVGr/webpack'],
      },
    ],
  },
}
```

上面这段配置看上去很简单，当我往项目中配置时，却又遇到了困难，有的时候打包配置是在一个单独的包中，比如使用 [vite](https://vitejs.dev 'https://vitejs.dev') 脚手架创建的 react 项目， 想要在项目中支持直接使用 SVG, 就必须写一个自定义 plugin。

所以我写了一个油猴脚本，可以在 iconfont.cn 上直接复制 React component 代码，如此一来，我们就省去了配置 webpack 的烦恼。

## 使用

Tampermonkey 是一个 chrome 插件，允许开发者直接在上面发布脚本，相当于是一个简易的 chrome 插件，若要在 chrome 扩展商店中发布插件的话，需要花费 5 美元。

- 第一步： [安装 chrome Tampermonkey 扩展](https://chrome.pictureknow.com/extension?id=4d999497b75d4eb6acf4d0db3053f1af 'https://chrome.pictureknow.com/extension?id=4d999497b75d4eb6acf4d0db3053f1af')
- 第二步： [安装 IconfontR 插件](https://greasyfork.org/zh-CN/scripts/447288-iconfontr 'https://greasyfork.org/zh-CN/scripts/447288-iconfontr')

名字来源 svgr ，就是 `iconfont + React component = IconfontR`

![iconfontr 效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d207222ce5c74da0b9299bb22cc52d8b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

装完插件后会在原先的下载按钮边上多出一个复制按钮，点击复制按钮复制 react 代码，就可以在 react 项目中粘贴使用了。

## 实现原理

其实 svgr 可以提供了在 nodejs 中执行的版本 [@svgr/core](https://www.npmjs.com/package/@svgr/core 'https://www.npmjs.com/package/@svgr/core')。

**安装**

```bash
npm install --save-dev @svgr/core
# or use yarn
yarn add --dev @svgr/core
```

引入 `@SVGr/core` 这个包，我们就可以直接使用啦！

- source: SVG 源码
- options: SVGr 配置参数
- state: 转变为 react component 的配置参数

**使用**

```js
import { transform } from '@SVGr/core'

const SVGCode = `
<SVG xmlns="http://www.w3.org/2000/SVG"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect x="10" y="10" height="100" width="100"
    style="stroke:#ff0000; fill: #0000ff"/>
</SVG>
`

const jsCode = await transform(SVGCode, { icon: true }, { componentName: 'MyComponent' })
```

所以我们可以写一个云函数，直接部署到 [vercel](https://vercel.com/ 'https://vercel.com/') 上，下面是 nodejs 云函数代码：

```js
import { VercelRequest, VercelResponse } from '@vercel/node'
import { transform } from '@SVGr/core'

export default async (request: VercelRequest, response: VercelResponse) => {
  const { SVGCode } = request.query
  try {
    const jsCode = await transform(SVGCode, { icon: true }, { componentName: 'SVGComponent' })
    return {
      output: SVGCode,
    }
  } catch (error) {
    response.status(200).send(error.message)
  }
}
```

当不是成功后，我们就可以直接使用云函数的部署地址，直接通过 fetch 调用就可以啦，传入 SVG 源码，输入 react component 组件源码，当然你也可以使用国内的云开发平台，腾讯云或阿里云，主要是因为 vercel 是完全免费的。

## 直接使用 svgr playground 的接口

当我看到 [svgr playground](https://react-SVGr.com/playground/ 'https://react-SVGr.com/playground/') 的时候，我就想知道它的实现原理，打开控制台一看，我们连云函数都不用写了，它就是一个部署在 vercel 上的一个接口。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/073f8ec04d0641b4a6fb7c23c790e44b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

`access-control-allow-origin: *`并且允许跨域，所以我们可以直接调用了。

接下来我们只需要通过 Dom api 获得当前点击元素的 SVG 代码

![dom 获取 SVG 元素](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b4e798d956a45369a6504e59745bdf4~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

在每个图标的操作覆盖层加入一新图标，用于复制 react component

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/448173c1f9884cfaba7ec96a29aa2075~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 原先是块级布局，一列显示 3 行

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/695150db72b4427d96f4652444f70b85~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

为了减少页面空间, 将覆盖的背景层改成 grid 布局，正好 2 行 2 列。

- `grid-template-rows: repeat(2, minmax(0, 1fr));` 平均分 2 行；
- `grid-template-columns: repeat(2, minmax(0, 1fr));`平均分 2 列，

## 脚本全部代码

```js
;(function () {
  // 请求接口
  async function fetchSVGr(code) {
    return await fetch('https://api.react-SVGr.com/api/SVGr', {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        options: {
          icon: false,
          native: false,
          typescript: false,
          ref: false,
          memo: false,
          titleProp: false,
          expandProps: 'end',
          replaceAttrValues: {},
          SVGProps: {},
          SVGo: true,
          SVGoConfig: {
            plugins: [{ name: 'preset-default', params: { overrides: { removeTitle: false } } }],
          },
          prettier: true,
          prettierConfig: { semi: false },
        },
      }),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    }).then((res) => res.json())
  }

  // 往 head 中插入覆盖样式
  const style = `.page-manage-project .project-iconlist .block-icon-list li.cover .icon-cover-unfreeze, .page-manage-project .project-iconlist .block-icon-list li:hover .icon-cover-unfreeze,
.block-icon-list li:hover .icon-cover {
  display: grid!important;
}
.page-manage-project .project-iconlist .block-icon-list li .icon-cover {
  grid-template-rows: repeat(3, minmax(0, 1fr));
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.block-icon-list li .icon-cover {
  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.block-icon-list li .icon-cover .cover-item{
  width:auto;
}
.page-manage-project .project-iconlist .block-icon-list li .icon-cover .cover-code{
  height: auto;
  line-height: 40px;
}
.block-icon-list li .icon-cover .cover-item-line {
  height: auto;
  line-height: 52.5px;
}`

  const styleEl = document.createElement('style')
  styleEl.textContent = style
  document.head.appendChild(styleEl)

  function addCopybtn() {
    console.log([...document.querySelectorAll('.icon-cover')])
    ;[...document.querySelectorAll('.icon-cover')].forEach((item) => {
      const span = document.createElement('span')
      span.title = '复制 React component'
      span.className = 'cover-item iconfont cover-item-line icon-fuzhidaima'

      span.onclick = async () => {
        const SVG = `<SVG width="128" height="128" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/SVG">${
          item.parentNode.querySelector('SVG').innerHTML
        }</SVG>`
        console.log('SVG', SVG)
        try {
          const res = await fetchSVGr(SVG)
          navigator.clipboard.writeText(res.output)
          console.log('React component 复制成功！')
        } catch (error) {
          console.log('请求服务出错')
        }
      }
      item.appendChild(span)
    })
  }
  // 监听路
  window.onpopstate = function (event) {
    addCopybtn()
  }

  // 调用 `history.pushState()` 或者 `history.replaceState()` 不会触发 `popstate` 事件，所以是点击时，对比 url 判断
  let href = window.location.href
  document.addEventListener('click', (e) => {
    setTimeout(() => {
      if (window.location.href !== href) {
        addCopybtn()
        href = window.location.href
      }
    }, 500)
  })

  //由于异步加载，需要延迟执行
  setTimeout(() => {
    addCopybtn()
  }, 1000)
})()
```

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
