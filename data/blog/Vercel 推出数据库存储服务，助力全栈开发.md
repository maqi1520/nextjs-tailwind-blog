---
title: Vercel 推出数据库存储服务，助力全栈开发
date: 2023/5/4 12:59:18
lastmod: 2023/5/26 15:02:10
tags: [JavaScript, 数据库]
draft: false
summary: Vercel 是一个流行的 React.js、Next.js 等前端应用部署平台，我们可以一键将 Github 上的应用部署上线，但它缺少一个重要部分：数据库。不过现在已经有了四种新数据库可供选择。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/809e62b4d3a84b50b36d4ab6b6c3414a~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

## highlight: monokai-sublime

Vercel 是一个流行的 React.js、Next.js 等前端应用部署平台，我们可以一键将 Github 上的应用部署上线，但它缺少一个重要部分：数据库。不过现在已经有了四种新数据库可供选择。

数据是 Web 应用中不可或缺的一部分，在这之前我们可以配合使用 Heroku 的数据库服务，但后来 Heroku 收费，不再提供免费的数据库，社区中也一直寻找免费试用的数据库方案，现在我们可以直接选择 Vercel 来上线一个动态网站， 并且使用 JavaScript 和 TypeScript 框架服务端渲染实时数据会比以往任何时候都更容易。

5 月 1 日，Vercel 宣布一套 serverless 存储解决方案现已在 Vercel 上可用，是由业内一些最佳基础设施提供商提供支持。

- Vercel KV：一种简单耐用的 serverless Redis 解决方案，由 Upstash 提供支持
- Vercel Postgres：为前端构建的 serverless SQL 数据库，由 Neon 提供支持
- Vercel Blob：一种在边缘上传、提供文件对象存储的解决方案，由 Cloudflare R2 提供支持

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bfded79162e94609ad007238547df948~tplv-k3u1fbpfcp-zoom-1.image)

## Vercel KV：持久的 Redis 数据库

它是一种基于 Upstash E-Value 的键值存储（类似 Redis）。操作数据库非常容易，更重要的是它非常快速，因为与大多数数据库不同，数据保存在内存中而不是磁盘上， 这意味着它可用于持久化状态，而不会在服务器崩溃时丢失数据，也就是说，在读取方面会变得极其迅速，是缓存数据的理想选择。

**使用示例**

```js
import kv from '@vercel/kv'

export async function getPrefs() {
  const prefs = await kv.get('prefs')
  return prefs || {}
}

export async function updatePrefs(prefs: Record<string, string>) {
  return kv.set('prefs', prefs)
}
```

**价格**

在 2023 年 6 月 1 日之前，不会因超过基本限制的按需使用而被收取费用。

- Hobby 免费用户，每天的请求限制为 3000 次， 存储 256 MB。
- Pro 用户 512 MB - 超出 1GB/$0.20 当达到此限制时，对数据库的请求将受到速率限制。

## Vercel Postgres：让复杂数据变得简单

PostgreSQL 是许多开发人员处理关系数据的首选方式。这个数据库好处在于它可以自动扩展、容错性强，并且有一个易于使用的 UI 界面。基本上你只需要点击一个按钮，就可以将你的数据库连接链接添加到环境中，然后就可以直接在 React Server Component 中编写原始 SQL 代码了。

**使用示例**

```js
import { sql } from '@vercel/postgres'
import { redirect } from 'next/navigation'

async function create(formData: FormData) {
  'use server'
  const { rows } = await sql`
    INSERT INTO products (name)
    VALUES (${formData.get('name')})
  `
  redirect(`/product/${rows[0].slug}`)
}

export default function Page() {
  return (
    <form action={create}>
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

我们可以使用 Vercel Postgres 直接在 React 服务器组件内查询、插入、更新或删除数据，以静态的速度在服务器上渲染动态内容，并且大大减少客户端 JavaScript 代码

此外，它还与 Keisely 和我个人最喜欢的 Prisma ORM 库良好地集成。

**价格**

- 免费用户，每月的计算时间 60 hours，存储 256 MB。
- Pro 用户, 每月的计算时间 100 hours 存储 512 MB, 超出 1GB/$0.30 当达到此限制时，对数据库的请求将受到速率限制。

Hobby 默认免费使用，当您接近使用限制时，Vercel 会向您发送电子邮件。不会为任何额外的使用付费，我们可以选择：

- 30 天后过期
- 升级到 Pro

## Vercel Blob：文件对象存储

Vercel Blob 是一种用于在云中存储文件的快速、简单且高效的解决方案。它提供了一个完全基于 Web 标准构建的轻松而强大的存储 API，无需配置存储桶或实施繁重的 SDK。目前需要申请使用。

**使用示例**

```js
import { put } from '@vercel/blob'

export const runtime = 'edge'

export async function PUT(request: Request) {
  const { url } = await put('avatars/user-12345.png', request.body, { access: 'public' })

  return Response.json({ url })
}
```

它基于 Cloudflare R2 并允许你将大量非结构化数据（如图像和 PDF 文件）存储在云上。换句话说，它可以替代 S3 等存储桶。SDK 非常简单——只需调用 `put` 方法并传入要上传的文件即可返回下载 URL 。但目前存在一个限制：最大文件上传大小为 4MB ，在测试版阶段之后应该会增加。

## Edge Config

它是一种全局数据存储，使您能够在边缘读取数据，而无需查询外部数据库或访问上游服务器。大多数查找在不到 1ms 的时间内返回，99%的读取将在 10ms 以下返回。

**使用示例**

```js
import { NextResponse, NextRequest } from 'next/server'
import { get } from '@vercel/edge-config'

export async function middleware(request: NextRequest) {
  if (await get('showNewDashboard')) {
    return NextResponse.rewrite(new URL('/new-dashboard', request.url))
  }
}
```

使用场景

- 以超低延迟获取数据。例如，你应该将功能标志开关存储在 Edge Config 存储中

- 存储经常读取但很少更改的数据。例如，您应该将关键重定向 URL 存储在 Edge Config 存储中

- 读取每个区域中的数据。Edge Config 数据被主动复制到 Vercel 边缘网络中的所有区域

## 小结

笔者认为，随着框架从单一架构转向可组合架构，框架正在向服务端渲染优先转变。这种转变以 React Server Component 和将流式渲染为例。后端和数据库的选择并不缺乏。但对于新项目来说，选择仍然会让人无从下手，虽然 Vercel 的价格可能会高于其他服务商，但对于个人或者全栈的体验项目来说无疑是最好的选择。
