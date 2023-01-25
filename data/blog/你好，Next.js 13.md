---
title: 你好，Next.js 13
date: 2022/10/30 07:48:04
lastmod: 2023/1/25 11:42:52
tags: [Turbopack, React.js]
draft: false
summary: 上周发布了 Next.js 的一个全新的版本 13，它带来了全新的理念（server component），作为一名 Next.js 的爱好者，我们有必要重新学习和认识下它。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a99af6f1111845878f6401b0d6abeed8~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

theme: vuepress
highlight: monokai

---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

上周发布了 Next.js 的一个全新的版本 13，它带来了全新的理念（server component），作为一名 Next.js 的爱好者，我们有必要重新学习和认识下它。

## Turbopack

首先是最引入注目的，在 Next13 中加入了全新的打包工具 Turbopack， 它是出自 Webpack 作者 TobiasKoppers 之手，官方描述是：开发时更新速度比 Webpack 快 700 倍、比 Vite 快 10 倍，是不是有点迫不及待，想要熟手体验了呢？我们直接使用官方提供的 cli 创建一个 Next.js 工程。

```
npx create-next-app --example with-turbopack
```

![Next13 playground](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3645e2f3424944bf8d1f884dea4536c0~tplv-k3u1fbpfcp-zoom-1.image)

这是启动后的界面，这个 demo 不是一个简单的页面，而是一个包含了深度嵌套路由的例子。

下图我开发时的截图，Turbopack 直接在命令行中打印出了构建时间，我们看到启动时间只需要 2.3ms

![更新速度](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d64b6e42bd44bcf8e72aa5c01dae683~tplv-k3u1fbpfcp-zoom-1.image)

试着修改代码，程序会自动热更新，绝大多数次数更新时间都很快，但偶尔有几次更新时间却很长，图片中有一处需要 16s（我使用的是 Mac M1)，这其中的原因就不得而知了，尤大也发布了[测评](https://github.com/yyx990803/vite-vs-next-turbo-hmr 'vite 对比 next turbo 热更新')，使用 1000 个节点来对比更新速度，数据显示：根组件与 vite 时间几乎相同，叶子节点比 vite 快 68%，与官方称比 vite 快 10 倍相差甚远。当然目前 Turbopack 还处于 alpha 阶段，期待 Turbopack 能够尽快推出正式版。

### Turbopack 特点

- 开箱即用 TypeScript, JSX, CSS, CSS Modules, WebAssembly 等
- 增量计算： Turbopack 是建立在 Turbo 之上的，Turbo 是基于 Rust 的开源、增量记忆化框架，除了可以缓存代码，还可以缓存函数运行结果。
- 懒编译：例如，如果访问 localhost:3000，它将仅打包 `pages/index.jsx`，以及导入的模块。

### 为什么不选择 Vite 和 Esbuild？

Vite 依赖于浏览器的原生 ES Modules 系统，不需要打包代码，这种方法只需要转换单个 JS 文件，响应更新很快，但是如果文件过多，这种方式会导致浏览器大量级联网络请求，会导致启动时间相对较慢。所以作者选择同 webpack 一样方式，打包，但是使用了 Turbo 构建引擎，一个增量记忆化框架，永远不会重复相同的工作。

Esbuild 是一个非常快速的打包工具，但它并没有做太多的缓存，也没有 HMR（热更新），所以在开发环境下不适用。

## 为什么要改基于文件的路由系统

Next 13 另一个比较大的改动是基于文件的路由系统，增加了一个 `app` 目录，每一层路由必须建一个文件夹，在该文件夹中建立 `page.tsx` 作为该路由主页面

![App目录路由系统](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9741de1ba84b4b478863c0a8155cc6a6~tplv-k3u1fbpfcp-zoom-1.image)

而在 Next.js 12（以及以下）对应的路由系统，是所有路由文件都写在 `pages` 目录下，每个文件都会生成一个路由，很明显是这种方式更加简洁。

![pages 目录路由吸引](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ce5b803507740939189f51628f58bb0~tplv-k3u1fbpfcp-zoom-1.image)

那么，Next.js 为什么要改基于文件的路由系统呢？

主要有以下 3 点原因:

1. 实现嵌套路由和持久化缓存
2. 支持 React 18 中的 React server Component，实现 Streaming（流渲染）
3. 实现代码目录分组，将当前路由下的测试文件、组件、样式文件友好地放在一起，避免全局查找

## Next.js 12 中 Layout 实现方式

Tailwindcss 的作者 Adam Wathan 早在 2019 年就写过一篇博客，关于 [Next.js 如何实现持久化缓存](https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/ 'Next.js 如何实现持久化缓存')

其中有个[demo](https://codesandbox.io/s/0-no-persistent-layout-elements-o13dt?from-embed 'next 整个页面刷新例子')能够很好的说明 next.js 不能实现持久化缓存，大家可以在 codesandbox 中体验。

![切换导航，整个页面刷新](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bdd9894bbd340bd9cae762a06bbff88~tplv-k3u1fbpfcp-zoom-1.image)

实现方式是每个 page 页面直接引用 components 文件下的导航组件，当点击横向滚动条后面的导航页面，会导致整个页面都刷新，从而没有记录滚条的位置。

他解决办法是，需要通过往 Page 页面函数上添加静态方法`getLayout`来实现，详情代码可以看这个[例子](https://codesandbox.io/s/5-getlayout-function-on-page-and-layout-components-7e1bg?from-embed 'getlayout 实现导航不刷新')。

```js
// /pages/account-settings/basic-information.js
import SiteLayout from '../../components/SiteLayout'
import { getLayout } from '../../components/AccountSettingsLayout'

const AccountSettingsBasicInformation = () => <div>{/* ... */}</div>

AccountSettingsBasicInformation.getLayout = getLayout

export default AccountSettingsBasicInformation
```

比如上面例子中的`账户设置—->基本信息`页面代码，是在 Page 页面中绑定 `getLayout` 静态方法，`getLayout` 返回页面的公共导航组件。

在 `_app.tsx` 中调用 `getLayout` 方法，从而区别各个页面的 `layout` 布局不同。

```js
import React from 'react'
import App from 'next/app'

class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props
    const getLayout = Component.getLayout || ((page) => page)

    return getLayout(<Component {...pageProps}></Component>)
  }
}

export default MyApp
```

如果你也有之前的 Next 项目，也需要实现持久化缓存，可以参考这个例子。

## app 文件夹下的约定式路由

Next13 新增了 `app 文件夹` 来实现**约定式路由**，完美地实现了持久化缓存，以下是官方 `with-turbopack` 项目下部分页面结构

```
./app
├── GlobalNav.tsx
├── layout.tsx
├── page.tsx
├── layouts
│   ├── CategoryNav.tsx
│   ├── [categorySlug]
│   │   ├── SubCategoryNav.tsx
│   │   ├── [subCategorySlug]
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── template.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── template.tsx
```

对应的页面效果如下图

![next playground 嵌套路由](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a650b7ba8e2430286fcb1214ce084a4~tplv-k3u1fbpfcp-zoom-1.image)

我们看到每个文件下都有 3 个文件 `layout.tsx`、`page.tsx` 、`template.tsx`、

- `layout.tsx` 该路由下的公共导航，切换路由时，不会刷新，我们可以看箭头处的 Count 组件，并没有刷新
- `template.tsx` 该路由下的公共部分，切换路由时，会刷新
- `page.tsx` 该路由的主页面

当我们点击导航时候，页面上刷新部分边框会高亮闪烁，我们可以很好地理解代码目录结构组织与页面呈现的路由和渲染。

在 app 目录下每个文件夹下，还可以有 `loading.tsx`、`error.tsx`

- `loading.tsx` 该路由的主页面在异步渲染中，会显示的 loading 组件的内容；例如我们可以用它来写骨架屏（Skeleton）
- `error.tsx` 该路由的页面渲染出错，会显示该页面，也就是封装了 React 的 ErrorBoundary。

以上除了 `page.tsx` 其他文件都是可选的，除了这些约定名称的文件外，我们可以建立任意文件，比如 `components.tsx`、 `test.tsx` 等自定义文件。app 目录可以很好地将页面、组件、测试文件放在一起，管理代码目录，避免开发时全局查找。

### 路由分组

app 同层级目录下还支持多个 `layout`， 使用 `（文件夹）`区分，`（文件夹）`不会体现在路由上，只是单纯用来做代码分组。

```
./app
├── (checkout)
│   ├── checkout
│   │   └── page.tsx
│   ├── layout.tsx
│   └── template.tsx
├── (main)
│   ├── layout.tsx
│   ├── page.tsx
│   └── template.tsx
```

比如官方 playground 中关于电子商务的例子，`main` 和 `checkout` 的 layout 是不同的，可以根据实现功能自定义分组代码目录。

![playground 路由分组场景](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2370250c45f4eecb9f3725af5619af7~tplv-k3u1fbpfcp-zoom-1.image)

## React Server Components

**在 app 目录下的组件默认都是 React Server Components**，那么 React Server Components 有什么优势呢？

这里有几个概念

- CSR:所有前端打包到前端，通常会引起浏览器加载 JavaScript 过大，从而导致首屏白屏时间过长

- SSR：数据在服务端请求，通过 `renderToString` 方法将字符串 DOM 结构输出给浏览器，此时浏览器还不能交互，React 不能管理已经存在的 DOM，需要重新执行一遍，这个过程叫“注水”（Hydrate）。Next12 `getServerSideProps` 的渲染方式也就是 SSR。

SSR 解决了白屏时间过长的问题和 SEO 的问题，但也并不是完美的，过多的请求会导致服务端响应时间变长，“注水”（Hydrate）的过程也会导致客户端代码量的增加。

![博客页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02ffd647cc324fd9a750620fe7a024a0~tplv-k3u1fbpfcp-zoom-1.image)

比如一个传统的博客页面采用 Next12 的方式使用`getServerSideProps` 的方式渲染，那么就需要等 3 个接口全部返回才可以看到页面。

```js
// 每次请求执行
export async function getServerSideProps() {
  const list = await getBlogList()
  const detail = await getBlogDetail()
  const comments = await getComments()

  // Pass data to the page via props
  return { props: { list, detail, comments } }
}
```

- React Server Components ( [RFC](https://github.com/reactwg/react-18/discussions/37 'react-18 discussions') ) 与传统的 SSR 不同，优点是拥有**流式 HTML 和选择性注水**

React `Suspense` API 解锁了 React 18 中的两个主要 SSR 功能：

- 在服务器上流式传输 HTML。

  要实现这个功能，需要从原来的方法切换`renderToString`切换到新`renderToPipeableStream`方法。

- 客户端的选择性注水作用。

  使用 `hydrateRoot` 代替 `createRoot` 方法。

比如上面的博客实例，评论接口查询速度较慢，就可以使用 `Suspense` 实现流渲染。

```js
import { lazy } from 'react'
const Comments = lazy(() => import('./Comments.js'))
//...
return (
  <Layout>
    <NavBar />
    <Sidebar />
    <RightPane>
      <Post />
      <Suspense fallback={<Spinner />}>
        <Comments />
      </Suspense>
    </RightPane>
  </Layout>
)
```

![react server component 流渲染](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a8a0ce34e2748cb99cdfc7be6bfc21f~tplv-k3u1fbpfcp-zoom-1.image)

如图所示

- 灰色部分代表 HTML 字符串返回
- loading 状态表示当前部分还在请求
- 绿色部分代表注水成功，页面可以交互

所谓的流就是通过 script 动态返回最小 html，并且插入到正确的位置，页面中如果有多个 Suspense，是没有先后顺序的，React Server Components 是并行的。

以上内容在[《New Suspense SSR Architecture in React 18》](https://github.com/reactwg/react-18/discussions/37) 中可以找到，而要搭建 react 流渲染的架构相对比较复杂，大家可以看 gaearon dan 的 [demo](https://codesandbox.io/s/kind-sammet-j56ro?file=/src/App.js 'gaearon dan 的示例')，而 Next.js 13 只需要在 app 目录下，按照约定的文件名称写，就可以自动实现 React Server Components。

## 实现流渲染

![server component 流渲染](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c136ba32d1eb4ae5a049839506a2f000~tplv-k3u1fbpfcp-zoom-1.image)

除了 app 目录下嵌套路由部分 next.js 会帮我们默认采用 React Server Components，我们在 page 页面中，也可以实现。

实现方式也很简单，组件外层使用 `Suspense`

```jsx
import { SkeletonCard } from '@/ui/SkeletonCard'
import { Suspense } from 'react'
import Description from './description'

export default function Posts() {
  return (
    <section>
      <Suspense
        fallback={
          <div className="h-40 w-full ">
            <SkeletonCard isLoading={true} />
          </div>
        }
      >
        <Description />
      </Suspense>
    </section>
  )
}
```

组件数据请求使用 `use` API，就可以实现流渲染了。

```tsx
import { use } from 'react'

async function fetchDescription(): Promise<string> {
  return fetch('http://www.example.com/api/data').then((res) => res.text())
}

export default function Description() {
  let msg = use(fetchDescription())
  return (
    <section>
      <div>{msg}</div>
    </section>
  )
}
```

**使用场景**

从官方的 playground 中看，在一些请求较慢的接口，比如电商网站中的价格计算，若要使用服务端渲染，就可以使用 server Component。
![价格计算使用场景](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81c7d33b32b240e299e2d82c0dbda382~tplv-k3u1fbpfcp-zoom-1.image)

## 服务端组件和客户端组件

Next.js 最大的优势就是我们只需要一个工程，就可以搞定前端工程和后端工程，哪些是前端代码和哪些是后端代码，Next.js 在打包的时候就会帮我们自动区分，这需要开发者清楚地理解，自己写的代码哪些是在服务端执行，哪些是在客户端执行。

### Next12 区分

我们知道 Page 函数都是在服务端执行的，包括 `getServerSideProps`、`getStaticPaths`、`getStaticProps`，那么如果需要在客户端执行有以下 2 种方式；

- 在 `useEffect`、 `onChange` 等回调函数中使用，比如下面例子，动态加载了 `fuse.js`，实现模糊搜索。

```js
import { useState } from 'react'

const names = ['Tim', 'Joe', 'Bel', 'Lee']

export default function Page() {
  const [results, setResults] = useState()

  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        onChange={async (e) => {
          const { value } = e.currentTarget
          // Dynamically load fuse.js
          const Fuse = (await import('fuse.js')).default
          const fuse = new Fuse(names)

          setResults(fuse.search(value))
        }}
      />
      <pre>Results: {JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
```

- 如果依赖了外部组件，或者 window 对象，可以使用 `next/dynamic` 并且设置 `ssr` 为 `false`

```js
import dynamic from 'next/dynamic'

const DynamicHeader = dynamic(() => import('../components/header'), {
  ssr: false,
})
```

### Next13 区分

在 Next13 中 ， 在 app 目录下，如要使用 `useState` 等状态管理的 hook，那么该组件只在客户端执行，需要在首行加入 `'use client'` 指令。

```js
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

**该区分服务端组件和客户端组件**，下表列出了常用使用场景

| 使用场景                                                                  | 服务端组件 | 客户端组件 |
| ------------------------------------------------------------------------- | ---------- | ---------- |
| fetch 请求数据。                                                          | ✅         | [⚠️]       |
| 访问后端资源（直接）                                                      | ✅         | ❌         |
| 在服务器上保留敏感信息（访问令牌、API 密钥等）                            | ✅         | ❌         |
| 保持对服务器的大量依赖/减少客户端 JavaScript                              | ✅         | ❌         |
| 添加交互和事件侦听器（`onClick()`,`onChange()`等）                        | ❌         | ✅         |
| 使用状态和生命周期效果（`useState()`, `useReducer()`, `useEffect()`, 等） | ❌         | ✅         |
| 使用仅限浏览器的 API(window)                                              | ❌         | ✅         |
| 使用依赖于状态、效果或仅浏览器 API 的自定义 hooks                         | ❌         | ✅         |
| 使用`React 类组件`                                                        | ❌         | ✅         |

## 数据请求

使用 react 的 use 函数加 fetch API 来实现：静态站点生成（SSG）、服务器端渲染（SSR）和增量静态再生（ISR）

在 Page 页面使用 fetch：

```js
import { use } from 'react'

async function getData() {
  const res = await fetch('...')
  const name: string = await res.json()
  return name
}

export default function Page() {
  // 支持的全类型的数据格式
  // 可以返回不用序列化的格式数据
  // 因此可以返回 Date, Map, Set, 等.
  const name = use(getData())

  return '...'
}
```

fetch 的缓存策略

```js
// 请求被缓存
// 相当于 `getStaticProps`.
// `force-cache` 是默认值，可以省略
fetch(URL, { cache: 'force-cache' })

// 每次刷新都会重新请求.
// 相当于 `getServerSideProps`.
fetch(URL, { cache: 'no-store' })

// 请求被缓存10s，10s 重新生成
// 相当于 `getStaticProps` 加上 `revalidate` 参数.
fetch(URL, { next: { revalidate: 10 } })
```

使用这种方式的优点是，当请求数据的增加，打包后前端 JavaScript 的大小不会增加。

## 新的 next/image

我们知道在 Next.js 12 之前，使用 `<img>`标签，eslint 会有一个警告，提示我们必须使用 `next/image` 组件， 因为 `next/image` 帮我们做了几点优化

- 自动优化图片格式
- 自动缩放图片大小
- 使用`Intersection Observer API` 实现懒加载

所以 image 必须加上 `width` 和 `height` 参数

新的 Next/image 使用了浏览器的 [lazy-loading](https://web.dev/browser-level-image-lazy-loading/ 'image-lazy-loading') 代替了 `Intersection Observer API`
默认情况下需要 alt 标记，因此减少了客户端 JavaScript 代码，当然这个属性对浏览器要求较高，要求 chrome 77+。

```js
import Image from 'next/image'
import avatar from './lee.png'

function Home() {
  // 为了提高可访问性 "alt" 属性是必须的
  // 图片可以使用放在 `app/`  目录下
  return <Image alt="leeerob" src={avatar} placeholder="blur" />
}
```

## @next/font

加入了一个新的包，可以在构建时直接引用 google 字体和本地字体，实现字体的托管和预加载，这点对英文网站很有用，中文网站一般不加载字体，图标建议使用 svg。

加载谷歌字体

```js
import { Inter } from '@next/font/google';
const inter = Inter();
<html className={inter.className}>
```

加载本地字体

```js
import localFont from '@next/font/local';
const myFont = localFont({ src: './my-font.woff2' });
<html className={myFont.className}>
```

## next/link

自动加上 `<a>`标签。

Next.js 12: 需要`<a>` 包裹

```js
import Link from 'next/link'
;<Link href="/about">
  <a>About</a>
</Link>
```

Next.js 13: `<Link>` 不需要 `<a>`

```js
<Link href="/about">About</Link>
```

## 小结

本文主要结合了 [Next13 官网博客](https://nextjs.org/blog/next-13) 摘取了部分内容，结合笔者对 Next.js 的理解和分析，介绍了其变动、使用方法，以及其改动原因， Next13 这次更新主要与 React server component 深度结合，在"用户体验、可维护性、性能"这几个方面都带来了巨大的提升，本以为 React 的 Server component 还遥不可及，但 Next13 却让我们触手可及， Next13 也将成为升级 React18 的首选框架，未来前后端并行的开发模式或许能够成为主流，这也将是对前端开发者的一个挑战。

以上就是本文的全部内容，关于 Next13 你学会了吗？欢迎在评论区留言讨论，文中若有不正之处，万望告知。
