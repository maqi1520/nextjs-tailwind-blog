---
title: 使用 Next.js 和掘金 API 打造个性博客
date: 2022/9/19 23:53:53
lastmod: 2023/1/25 11:43:02
tags: [React.js]
draft: false
summary: 在本文中，我将分享我的方法，通过掘金 API 打造个性博客，只要在掘金发表文章，就会自动同步到自己的博客中。
images: https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79db308ca97941e9aee5a32b2882f122~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 阅读本文，你将收获:

- 通过 chrome 调试工具获得掘金 api

- 学会使用 Next.js 服务端渲染

- 学会使用 Tailwindcss 来代替原生 css

- 在几分钟内就可以部署一个自己的博客

## 背景

在开始之前，我想先问下各位，是否有自建博客？很多人选择在社区写博客，比如：掘金，因为在社区写博客能够第一时间被人看到，能够第一时间把知识分享出去，也可以在第一时间得到他们反馈和评论。
但在社区写博客也有劣势，比如掘金社区只能写技术文章，并不能完全展现你自己的个性。比如，我是一名前端开发者，在社区看我的文章，只能体现我是一名前端，但同时我又是一名摄影爱好者，这点就没办法体现了，所以这就是自建博客的优势，有非常高的灵活度，可以自己设计想要的风格和模块。但自建博客也有非常大的劣势，第一点就是部署到服务器，有一定花费，其次就是新建博客几乎没流量，所以我们需要在各大社区论坛发表文章，给自己的博客引流。这样一来，就迎来另一个问题，我需要在两个地方发表，这不就是重复劳动吗？

接下来，我就分享下我的方法，通过掘金 API 打造个性博客，只要在掘金发表文章，就会自动同步到自己的博客中。

本文涉及的代码都在[这个 Github 仓库](https://github.com/maqi1520/nextjs-juejin-blog 'nextjs-juejin-blog')中。

## 获取掘金 API

打开掘金主页，使用 chrome devtools 很容易可以找到获取文章列表的接口。

![devtools 查看文章列表接口](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eeff54e385ec4f06a0e2f47d20b644d6~tplv-k3u1fbpfcp-zoom-1.image)

可以看到接口返回了文章列表数据 `data`，文章总数 `count`，以及当前的分页游标 `cursor`

我们使用 axios 在 nodejs 中请求数据，封装成一个 `getArticles` 方法

```js
export async function getArticles(uid: string, cursor: number = 0) {
  const res = await axios.post('https://api.juejin.cn/content_api/v1/article/query_list', {
    cursor: cursor + '',
    sort_type: 2,
    user_id: uid + '',
  })

  return res.data
}
```

![devtools 查看文章详情接口](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a16e5d6260b4a84a1f095fd24563951~tplv-k3u1fbpfcp-zoom-1.image)

通过查看文章详情页，我们可以复制出接口，使用 axios 修改下，封装成 `getArticleDetail` 方法

```js
export async function getArticleDetail(article_id: string) {
  const res = await axios.post('https://api.juejin.cn/content_api/v1/article/detail', {
    article_id,
  })

  return res.data
}
```

有了接口，我们就可以用它来搭建自己的博客了。

## 初始化项目

接下来，我们将从零开始创建一个 next 项目，并且选择 Typescript 模板

```bash
npx create-next-app --ts nextjs-juejin-blog
cd nextjs-juejin-blog
yarn dev
```

创建项目后，脚手架会帮我们自动执行 `yarn install`。

打开 http://localhost:3000/ 你将看到如下页面

![Next.js 默认页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7c8c4d0f3664167be138dd3fab69314~tplv-k3u1fbpfcp-zoom-1.image)

## 添加 Tailwind CSS

Tailwind CSS 是一个 CSS 原子类样式框架，我们可以使用现成的样式， 比如`flex`、`text-3xl`、`mr-3` 等等，并且这些 CSS 会在构建的时候，打包出最小的样式文件。没接触过的小伙伴，一开始可能会不习惯，但写完一个项目后，你会爱不释手，因为所有的 CSS 都在组件中，并且一目了然。如果你之前的项目中使用的是 CSS modules，当项目变得复杂后，若没维护好的话，到最后可能会面向 vscode 搜索编程。

在开始之前，你首先需要的 VSCODE 中安装 [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss 'Tailwind CSS IntelliSense') 插件，这样在你写 class 的时候，就会有智能提示，鼠标移动到 class 上，也可以看到具体的 CSS 属性。

![Tailwind CSS IntelliSense](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b08a4f2d1594af3ab51a5c2648380e4~tplv-k3u1fbpfcp-watermark.image?)

接下来，我们可以在命令行中运行下面命令

1. 安装 npm 包

```bash
yarn add -D tailwindcss postcss autoprefixer
```

Tailwindcss 的编译依赖 postcss，autoprefixer 会自动根据 `Can I Use` 标准给 CSS 属性添加浏览器适配前缀。

2. 初始化 `tailwind.config.js` 配置文件

```bash
npx tailwindcss init -p
```

3. 修改 `tailwind.config.js` 配置文件，修改下 `content` 字段构建，修改后，只会打包 content 中匹配文件使用到的 class

```js
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        //@ts-ignore
        gray: colors.neutral, // TODO: Remove ts-ignore after tw types gets updated to v3
      },
    },
  },
  plugins: [],
}
```

扩展一个 `primary color`，主色调统一使用这个，方便后续不同的人使用这个模板，可以方便地修改主色

调整下目录，将主要的代码目录都移动到 `src` 下

```bash
mkdir src
mkdir src/components
mv styles src
mv pages src
```

这点是个人爱好，你可以遵循原来的目录。

4. 修改 `/src/styles/globals.css` 中的 CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`@tailwind` 指令会在运行的时候生成默认样式。

## 约定式路由

在 `pages` 或者 `src/pages` 文件夹下建立文件或文件夹，Next.js 会帮我自动创建路由系统。

比如我们创建如下目录结构：

```bash
src/pages
├── _app.tsx
├── api
│   └── hello.ts
├── blog
│   ├── [...slug].tsx
│   └── page
│       └── [page].tsx
├── blog.tsx
└── index.tsx
```

就会创建如下路由

```bash
/api/hello
/blog/page/:page
/blog/:slug
/blog
```

- 其中 `[page]` 是变量，可以匹配任意值，那么我们的路由就是： `/blog/page/1`;
- `[...slug]` 是多层变量，可以匹配`/blog/a`、`/blog/a/b`、`/blog/a/b/c` 等等。

## 服务端渲染

在 Next.js 中，在 Page 页面中可以导出一个 `getServerSideProps` 方法，用于服务端获取数据。

下面我们来实现下博客列表页面，需要获取 `url` 上的翻页参数

```ts
import React from 'react'
import { GetServerSidePropsContext } from 'next'
import { getArticles } from '../lib/db'
import { InferGetServerSidePropsType } from 'next'

export default function Page({
  data,
  count,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Render data...
  console.log(data)
}

// 每次刷新页面都后执行这个函数
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const page = (context.query?.page as string) || 1
  // 通过 API 请求数据
  const uid = process.env.uid!
  const { data, count } = await getArticles(uid, (+page - 1) * 10)

  // 将数据传递到页面上
  return { props: { data, count, page: +page } }
}
```

新建一个`.env` 文件，将掘金的 ID 设置为 uid，我们就可以在 nodejs 中通过`process.env`获取这个值。

此时的 data 就是文章列表数据，复制其中一条数据，使用[工具](https://www.runjs.cool/json-to-typescript 'json-to-typescript')将 json 转为 typescript 类型，删除一些我们不需要的字段，我们就可以得到 `Article` 的 ts 类型定义。

```ts
export interface Article {
  article_id: string
  article_info: ArticleInfo
  category: Category
  tags: Tag[]
}

export interface ArticleInfo {
  article_id: string
  cover_image: string
  title: string
  brief_content: string
  content: string
  ctime: string
  mtime: string
  rtime: string
  view_count: number
  collect_count: number
  digg_count: number
  comment_count: number
}

export interface Category {
  category_id: string
  category_name: string
}

export interface Tag {
  id: number
  tag_id: string
  tag_name: string
}
```

## 文章列表页实现

下面我们用 Tailwind css 来实现下 `ArticleList` 组件

```ts
import React from 'react'
import Link from 'next/link'
import Pagination from './Pagination'

export default function ArticleList({ articles, totalPages, currentPage }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <ul>
        {articles.map((article) => (
          <li key={article.article_id} className="py-4">
            <article className="xl:grid xl:grid-cols-4 xl:items-start xl:gap-2">
              <dl>
                <dt>
                  <img
                    className="w-52"
                    src={article.article_info.cover_image}
                    alt={article.article_info.title}
                  />
                </dt>
                <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                  <span className="sr-only">Published on</span>
                  <time>
                    {new Date(+article.article_info.ctime * 1000).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </dd>
              </dl>
              <div className="space-y-3 xl:col-span-3">
                <div>
                  <h3 className="text-2xl font-bold leading-8 tracking-tight">
                    <Link
                      className="text-gray-900 dark:text-gray-100"
                      href={`/blog/${article.article_id}`}
                    >
                      {article.article_info.title}
                    </Link>
                  </h3>
                  <div className="mt-3 flex flex-wrap">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.tag_id}
                        className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                        href={`/tags/${tag.tag_name}`}
                      >
                        {tag.tag_name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                  {article.article_info.brief_content}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
```

- 页面之间的跳转，我们应该使用 `next/link` ，而不是 `<a>`标签，跟 react-router 中的`Link`类似，用户点击链接，并不会全局刷新，而是动态替换网页中的内容。
- Tailwindcss 默认是移动优先，若要适配其他屏幕，可以在样式前面加 md、lg、xl、2xl 等前缀， 上面代码中的 `xl:`代表屏幕宽度大于 1280px 应用的样式。

### 翻页组件

`getArticles` 方法中返回了 `count` 文章总数，我们可以根据它和当前的 `currentPage` 封装成一个分页组件，代码如下：

```ts
import Link from 'next/link'

interface Props {
  totalPages: number
  currentPage: number
}

export default function Pagination({ totalPages, currentPage }: Props) {
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            上一页
          </button>
        )}
        {prevPage && (
          <Link href={currentPage - 1 === 1 ? `/blog/` : `/blog/page/${currentPage - 1}`}>
            <button>上一页</button>
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            下一页
          </button>
        )}
        {nextPage && (
          <Link href={`/blog/page/${currentPage + 1}`}>
            <button>下一页</button>
          </Link>
        )}
      </nav>
    </div>
  )
}
```

一起来看下效果吧

![文章列表页](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03c264c4fe0b408687463005c9e5fc02~tplv-k3u1fbpfcp-zoom-1.image)

### 路由重写

这里有一个疑问，其实我们的路由是 `/blog` 和 `blog/page/1` 这 2 个页面应该使用同一个组件，而现在我们需要在 pages 下面定义 2 个页面，那么 Next.js 中有没有可以配置的地方，可以重写路由，使用同一个组件呢？

答案是当然可以的，在 `next.config.js`, 配置 `rewrites` 字段。

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/blog/:id/edit',
        destination: `/blog/create`,
      },
      {
        source: '/blog/page/:page',
        destination: `/blog`,
      },
    ]
  },
}

module.exports = nextConfig
```

比如上面的配置中， 博客编辑页面 `/blog/:id/edit`，使用 `/blog/create`页面来实现，`rewrites` 字段也就是实现了 webpack devserver 的 `proxy` 功能，比如：后端有些接口使用 Java 实现，也可以使用 `rewrites` 实现代理联调。

## 文章详情

实现了文章列表页面，我们应该可以很快写出文章详情页面的页面代码，大致如下：

```ts
import { GetServerSidePropsContext } from 'next'
import ErrorPage from 'next/error'
import { getArticleDetail } from '../../lib/db'
import { InferGetServerSidePropsType } from 'next'
import { Article } from '../../types/article'

export default function Page({
  data,
  statusCode,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (statusCode) {
    return <ErrorPage statusCode={statusCode} />
  }
  console.log(data)
  //Render data...

  return <div className="prose"></div>
}

// 每次刷新页面都后执行这个函数
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slug = context.query?.slug as string[]
  // 通过 API 请求数据
  const res = await getArticleDetail(slug[0])
  if (res.err_msg === 'success') {
    // 将数据传递到页面上
    return { props: { data: res.data as Article } }
  }

  // 将数据传递到页面上
  return { props: { statusCode: 404 } }
}
```

实现方式跟列表页相同

- 在 `getServerSideProps` 中通过接口获取文章详情；
- 接口获取失败的时候返回状态码 404，并且使用`next/error` 显示成统一的错误页面；

接下来还有 3 个功能要实现：

1. markdown 格式转为 html

2. 文章详情页面的样式

3. 代码高亮

### markdown 转 html

请求接口后，得到的 markdown 内容结构如下

```md
---
highlight: monokai-sublime
---

## 正文内容
```

所以在解析 markdown 内容之前，还得解析 markdown 的前缀， 在命令行中安装以下 2 个包来实现这个功能。

```bash
yarn add markdown-it gray-matter
yarn add @types/markdown-it --dev
```

那么我便可以写出编译 markdown 内容的代码了：

```ts
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'

const md = new MarkdownIt()

export default function Page({
  data,
  statusCode,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (statusCode || !data) {
    return <Error statusCode={statusCode} />
  }

  const result = matter(data?.article_info.mark_content || '')

  return (
    <div className="mx-auto">
      <header className="pt-6">
        <h1>{data?.article_info.title}</h1>
        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-base font-medium leading-6 text-gray-500">
            <time>
              {new Date(+data.article_info.ctime * 1000).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </dd>
        </dl>
        {data.article_info.cover_image && (
          <img
            className="max-w-full"
            src={data.article_info.cover_image}
            alt={data.article_info.title}
          />
        )}
      </header>
      <div
        dangerouslySetInnerHTML={{
          __html: md.render(result.content),
        }}
      ></div>
    </div>
  )
}
```

### 文章详情页面的样式

关于文章详情页的样式，我第一个想到的是[github-markdown-css](https://github.com/sindresorhus/github-markdown-css 'github-markdown-css'), 但今天要推荐的还是 Tailwindcss，`@tailwindcss/typography` 是官方提供的插件，可以帮助我们排版美化文章类页面的样式。

首先让我们来安装这个插件

```bash
yarn add  @tailwindcss/typography
```

然后在 `tailwind.config.js` 配置文件中加入这个插件:

```js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}
```

最后我们在文章最外层就可以加入 `prose` 这个样式了，`prose-indigo` 将主色调配置成湛蓝色，当然你可以改为其他 Tailwind css 中提供的默认颜色变量。

```html
<article class="prose prose-indigo">{{ markdown }}</article>
```

### 代码高亮

最后一步，代码高亮，我选择使用更加轻量的 prismjs，在 react 使用也很简单，详情可以参考之前写的这篇文章[《使用 Prism.js 对代码进行语法高亮》](https://juejin.cn/post/7088920558598881293 '使用 Prism.js 对代码进行语法高亮')。

```js
import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
...
useEffect(() => {
    Prism.highlightAll();
  }, [data]);
...
```

完成啦，一起来看下看下实现效果

![文章详情页面效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d88f680a5cf4157824a16ba9b1b94d0~tplv-k3u1fbpfcp-zoom-1.image)

## 个性化首页

到此，我们实现了文章列表页面和文章详情页面，现在还缺一个首页，写到这里，正巧发现今年有个主题是“航天”，那么我们就来设计一个“航天主题“的博客。

- 在爱给网等网站搜索主题相关的 png 免扣素材；
- 使用 canvas 粒子制作星空背景；

我们先来看下效果，再看实现代码。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4daf15d5d4dc4585864dab9bb9c5152d~tplv-k3u1fbpfcp-zoom-1.image)

下面是星空代码的实现，主要是实现思路

1. 随机在屏幕屏幕上初始化 800 个粒子
2. 使用 `requestAnimationFrame` 在原坐标基础上增加一定速度的系数
3. 粒子超出画布重新初始化粒子坐标
4. 使用 `ResizeObserver` 监听容器大小，重新初始化画布

```ts
const COUNT = 800
const SPEED = 0.1
class Star {
  x: number
  y: number
  z: number
  xPrev: number
  yPrev: number
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
    this.xPrev = x
    this.yPrev = y
  }
  update(width: number, height: number, speed: number) {
    this.xPrev = this.x
    this.yPrev = this.y
    this.z += speed * 0.0675
    this.x += this.x * (speed * 0.0225) * this.z
    this.y += this.y * (speed * 0.0225) * this.z
    // 超出屏幕坐标，初始化为随机值
    if (this.x > width / 2 || this.x < -width / 2 || this.y > height / 2 || this.y < -height / 2) {
      this.x = Math.random() * width - width / 2
      this.y = Math.random() * height - height / 2
      this.xPrev = this.x
      this.yPrev = this.y
      this.z = 0
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.z
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.xPrev, this.yPrev)
    ctx.stroke()
  }
}
const stars = Array.from({ length: COUNT }, () => new Star(0, 0, 0))
let rafId = 0
const canvas: HTMLCanvasElement = document.querySelector('#canvas')!
const ctx = canvas.getContext('2d')!
const container = ref.current!
// 监听 container 容器的变化，设置canvas 画布的大小
const resizeObserver = new ResizeObserver(setup)
resizeObserver.observe(container)
function setup() {
  // 缩放屏幕后取消动画
  rafId > 0 && cancelAnimationFrame(rafId)
  const { clientWidth: width, clientHeight: height } = container
  // 根据 dpi 缩放画布，保证高清屏显示
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height + 1}px`
  ctx.scale(dpr, dpr)
  // 初始化坐标为随机 正负 1/2 width
  for (const star of stars) {
    star.x = Math.random() * width - width / 2
    star.y = Math.random() * height - height / 2
    star.z = 0
  }
  // 中心点偏移到屏幕中心
  ctx.translate(width / 2, height / 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.strokeStyle = 'white'
  rafId = requestAnimationFrame(frame)
}
function frame() {
  const { clientWidth: width, clientHeight: height } = container
  for (const star of stars) {
    star.update(width, height, SPEED)
    star.draw(ctx)
  }
  ctx.fillRect(-width / 2, -height / 2, width, height)
  rafId = requestAnimationFrame(frame)
}
```

## 最后

我将该项目开源在 GitHub 中，你只需要：

- Fork [该仓库](https://github.com/maqi1520/nextjs-juejin-blog 'nextjs-juejin-blog')后，新建 `.env` 文件，写入 `uid=2189882895384093`, uid 值为掘金主页 url 上的 Id
- 修改 `src/config.js` 里的配置为你自己的配置，
- 使用 GitHub 账户登录 [vercel](https://vercel.com/) 导入这个项目， 即可部署成功

当然这个项目还存在一些问题，比如：

- 需要进行 SEO 优化等
- Vercel 部署 Region 选择香港，Serverless 函数访问掘金接口的速度还是有些慢。

## 后续

接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

- 使用 Strapi CSM 系统进行 Next.js 应用全栈开发
- 使用 Notion 数据库进行 Next.js 应用全栈开发
- 使用 Prisma 和 PostgreSQL 进行 Next.js 应用全栈开发
- 使用 NextAuth 实现 Next.js 应用的鉴权与认证
- 使用 React query 给 Next.js 应用全局状态管理
- 使用 i18next 实现 Next.js 应用国际化
- 使用 Playwright 进行 Next.js 应用的端到端测试
- 使用 Github actions 给 Next.js 应用创建 CI/CD
- 使用 Docker 部署 Next.js 应用
- 将 Next.js 应用部署到腾讯云 serverless

你对哪块内容比较感兴趣呢？欢迎在评论区留言，感谢您的阅读。
