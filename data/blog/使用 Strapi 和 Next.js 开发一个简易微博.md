---
title: 使用 Strapi 和 Next.js 开发一个简易微博
date: 2022/9/20 09:35:34
lastmod: 2023/1/25 11:43:01
tags: [React.js]
draft: false
summary: 本文主要介绍了使用 strapi 和 Next.js 实现了一个简易的微博，我们不必写后端，只需要后台配置便可以创建 api 接口，通过本文，我相信你对 strapi 有了一定了解。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d9fcadc6a134a2296ced2f4c2b5ee3d~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 阅读本文，你将收获：

- 如何使用 Strapi 创建后端 API
- 如何在 Next.js 中与单独后端联调
- 并且了解一个全栈应用的实现逻辑

## 背景

在上一篇文章中，我们使用了 Next.js 和掘金 API 创建了一个全栈博客，使用了抓包的方式获得了掘金 API，终究有些投机取巧，若没有 API ，就无法独立完成一个应用的，今天我将分享另一种方式，同样不需要写后端接口，通过可视化界面就可以创建 Restful API，那有了接口，我们就可以来实现任意应用啦，一起来看看吧。

本文全部代码都在 GitHub [仓库](https://github.com/maqi1520/strapi-weibo)中

## 实现功能与效果

先来看看我们要实现的效果

![效果预览](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03bf1bae632743e28f929cf93e894c42~tplv-k3u1fbpfcp-zoom-1.image)

实现功能

- 注册与登录
- 登录后可以发微博，并且可以在不同的话题下发布
- 上传图片
- 有一个后台可以管理微博

## 什么是 strapi

strapi 是免费开源的 Nodejs 无头 CMS 内容管理框架，可以通过后台管理界面创建自定义 API，并且完全使用 JavaScript 实现。
打开[strapi 官网](https://strapi.io/ 'strapi 官网')，首页的交互式动画映入眼睑。

![strapi 官网交互动画](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef58e932e13c46bd9a156801f207d64e~tplv-k3u1fbpfcp-zoom-1.image)

我们可以清楚的看到，在后台配置字段，便可以生成 JSON schema，有了 JSON schema， strapi 便会自动生成 Restful API，是不是很强大呢？

## 后端工程

### 初始化项目

我们先使用 strapi 官网提供的脚手架初始化一个后端应用

```bash
npx create-strapi-app backend --quickstart
```

创建完成后，它会帮我们自动安装 npm 包，安装完成后会显示如下命令

```bash
yarn develop
# 开发环境，开始 Strapi 进入监听模型，修改工程文件会自动重启
yarn start
# 生产环境，启动 Strapi
yarn build
# 构建 Strapi 后台.
yarn strapi
显示所有可用的命令
```

紧接着会自动进入 backend 帮我们执行 `yarn develop`，并且自动打开如下页面

![strapi 后台登录页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96e90ca462f347a7bb0ce9dd02184e05~tplv-k3u1fbpfcp-zoom-1.image)

首先我们要注册一个 admin 账号，随便输入一个就行， 但要记住这个账号

```
First name: admin
Email: admin@admin.com
Password: Admin@123
```

登录后来的 strapi 的主界面

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59312a9c9aa64e2a91f87d9517144d69~tplv-k3u1fbpfcp-zoom-1.image)

首页有关于 strapi 学习的主要入口，包括文档、代码示例、课程和博客。

纯英文的后台，一开始可能有些不习惯，我们可以使用 chrome 翻译插件直接翻译成中文

![strapi 后台欢迎页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7097d49307e948e18a259a1b16fa5f0d~tplv-k3u1fbpfcp-zoom-1.image)

### 建表

通过导航上的 `Content-Type Builder`，也就是`内容类型生成器`入口开始建立表。

我们首先来想想，微博系统该建哪些表？

![实体图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bfe5956183b94b989d70f82d69951c97~tplv-k3u1fbpfcp-zoom-1.image)

先来画一张实体图，梳理下各个实体直接的关系

- 一个用户可以发送多条信息：一对多
- 一个话题下也可以有多条信息：一对多
- 一条信息可以上传多张图片：一对多

那么我们可以以此来写出 TS 类型接口

```ts
interface User {
  id: number
  username: string
  email: string
  password: string
}

interface Topic {
  id: number
  title: string
  desc: string
}

interface Message {
  id: number
  content: string
  images: string[]
  user: User
  createdTime: number
  topic: Topic
}
```

我们可以看到，后台中已经有 User 集合了，所以可以不必建用户表了，点击
`Create new collection type`来创建一个新的集合：

![strapi 后台创建集合](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c38b190f1bb4c0fa4828e13393cabd1~tplv-k3u1fbpfcp-zoom-1.image)

输入 Display name 为 `topic` 主题表，右边的参数会自动填充，默认不用修改，点击 Continue 继续

![strapi 后台添加字段](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69994809d2d041299337416b618f577a~tplv-k3u1fbpfcp-zoom-1.image)

在弹出页面中，我们可以看到所有的字段类型，包含文本、邮箱、富文本、密码、数字、下拉选择等，只需要点击选择相应字段就可以建表字段了。

当我们建立完成一张表后，引导页面便会提示我们通过 api 访问接口了。

![strapi 后台提示 api 地址](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7a239b1c54048feaa16d7c72c2f2605~tplv-k3u1fbpfcp-zoom-1.image)

### 建立表关联

建立完 Message 表后，需要与 User 建立关系

![strapi 后台建立表关联](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fec74dede07a4562859187598ba13290~tplv-k3u1fbpfcp-zoom-1.image)

点击 User 表，选择 Relation 字段

![strapi 建立表关联一对多](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2cb383a0676040b5aa0e0c5a9bd287b9~tplv-k3u1fbpfcp-zoom-1.image)

在右侧选择 Message 表，中间关系选择一对多，Message 表关系字段，输入 user。

因为是多对一，一条 message 只属于一个用户，所以输入 user 单数，而不是 users，若是多对多的情况，我们要输入 users， 字段命名上的规范，可以让我们从接口返回数据看出对应的关系。

重复上述步骤我们可以建完所有表了，其中 images 表和用户表是我们不要建立的，因为用户和附件上传是通用功能，strapi 系统帮我们内置了，这真的是极大地加快了开发效率。

### 接口查询与获取

我们可以通过[官方的文档](https://docs.strapi.io/developer-docs/latest/plugins/users-permissions.html 'strapi 文档')地址找到对应的注册和登录接口。

使用接口管理工具访问下 api，比如我们注册一个用户，如下图

![apifox 调用注册](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93d52c83d75340c5b83ddaab934dc41e~tplv-k3u1fbpfcp-zoom-1.image)

访问后，便注册了一个用户， 但是，直接访问 `http://localhost:1337/api/messages` 时，可能会看到如下界面，状态码 403， 这是为什么呢？

![strapi 403](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de0e1cc9ac664982a1f46602003980db~tplv-k3u1fbpfcp-zoom-1.image)

因为我们还未对 message 表进行权限设置，所以无法访问。

![strapi 权限设置](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0be802f40a8d45b0af077e968532bf10~tplv-k3u1fbpfcp-zoom-1.image)

进入`settings ——> Roles ——> Public` ， 对每个接口的请求方法进行权限设置，

在 Public 选择 message 表，选择 `find`，点击保存，这样我们的 message 接口便可以在不授权的情况下访问了。

其中，角色分为 `Authenticated` 和 `Public`。

- `Authenticated` 是需要登录才能访问的接口
- `Public` 是不需要登录也可以访问的接口

![strapi 后台节点地址](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b86a504f1fa4469a69e5b093353b080~tplv-k3u1fbpfcp-zoom-1.image)

还有很重要的一点，所有的接口地址都可以通过这个地方查看和修改。

## 前端工程

使用 `create-next-app` 创建一个 next 工程，并且安装和初始化 tailwindcss

```
npx create-next-app frontend
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

修改 `globals.css` 为 tailwindcss 默认指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 首页布局

我们先来写一下首页页面样式和布局

```ts
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title> Next Strapi Weibo</title>
        <meta name="description" content="随时随地发现新鲜事" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="sticky top-0 border-t-4 border-orange-500 bg-white py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-mono text-2xl font-semibold">微博</h1>
          <div className="space-x-3">
            <button className="rounded-3xl border border-orange-500 bg-orange-500  px-5 py-2  font-semibold text-white">
              登录
            </button>
            <button className="rounded-3xl border border-orange-500 px-5 py-2 font-semibold text-orange-500">
              注册
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-5 flex min-h-screen max-w-5xl gap-5">
        <div className="sticky top-14 h-80 w-52 flex-none rounded-sm bg-white shadow-sm"></div>
        <div className="flex-auto rounded-sm bg-white shadow-sm"></div>
      </main>
      <footer className="mt-5 bg-white py-2 text-center">
        Copyright © 2009-2022 随时随地发现新鲜事
      </footer>
    </>
  )
}
```

看下效果，一个简单的页面结果呈现在我们眼前。

![首页页面结构](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2cbea954130a4c598f35f0544e4fc4a2~tplv-k3u1fbpfcp-zoom-1.image)

### 目录结构

```
├── components
│   ├── ImageList.tsx
│   ├── LoginModal.tsx
│   ├── RegisterModal.tsx
│   ├── SendMessage.tsx
│   └── TopicList.tsx
├── lib
│   ├── auth.ts
│   ├── message.ts
│   └── request.ts
├── pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── api
│   │   └── hello.ts
│   └── index.tsx
├── styles
│   └── globals.css
└── types
    ├── image.ts
    ├── message.ts
    ├── topic.ts
    └── user.ts
```

整理一下目录结构，将组件放入`components`目录下， 将接口请求想代码放到 `lib` 目录下，`types` 目录用于存放 typescript 实体接口。

### 前后端联调

此时

- 前端工程启动的端口是 http://localhost:3000/

- 后端启动的端口是 http://localhost:1337/

若是纯后端数据渲染，我们可以在 `Page` 中导出一个 `getServerSideProps` 方法，接口请求在 node.js 环境中执行，所以不存在跨域问题， 但在接下来的登录与注册功能中，避免不了跨域，难道要启一个 nginx 反向代理吗？

其实可以直接在 `next.config.js` 中直接配置路由重写。

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:1337/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:1337/uploads/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

重写路由将 `/api` 和 `/uploads` 开头的请求转发到 `http://localhost:1337`， 这样我们请求数据就不会存在跨域问题了。

### 登录注册实现

注册与登录是单独的逻辑，我们将它独立成单独的组件， 先来实现注册`RegisterModal.tsx`。

```bash
yarn add @headlessui/react
```

由于登录是弹窗的形式，我们安装一个 tailwindcss 官方的 UI 库，官网上有弹窗的 demo，我们可以直接拷贝，顺便改下成我们的组件代码。

```js
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, FormEventHandler, useRef } from 'react'
import { register, RegisterData } from '../lib/auth'

export default function RegisterModal() {
  let [isOpen, setIsOpen] = useState(false)
  let [loading, setLoaing] = useState(false)
  let [error, setError] = useState('')
  const ref = useRef < RegisterData > {}

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setLoaing(true)
    register(ref.current)
      .then((res) => {
        const data = res.data
        sessionStorage.setItem('jwt', data.jwt)

        sessionStorage.setItem('user', JSON.stringify(data.user))
        setLoaing(false)
        window.location.reload()
      })
      .catch((err) => {
        const res = err.response.data
        setError(res.error ? res.error.message : '请稍后再试')
        setLoaing(false)
      })
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-3xl border border-orange-500 px-5  py-2  font-semibold text-orange-500"
      >
        注册
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900">
                    注册
                  </Dialog.Title>
                  <section className="pt-5 text-gray-500">
                    {error && (
                      <div className="mb-5 flex items-center rounded border border-orange-500 bg-orange-50 p-3 text-orange-500">
                        <svg
                          className="mr-2 h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label>用户名:</label>
                        <input
                          className="w-full rounded border px-3 py-2"
                          type="username"
                          name="username"
                          onChange={(e) => (ref.current.username = e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label>邮箱:</label>
                        <input
                          className="w-full rounded border px-3 py-2"
                          type="email"
                          name="email"
                          onChange={(e) => (ref.current.email = e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label>密码:</label>
                        <input
                          className="w-full rounded border px-3 py-2"
                          type="password"
                          name="password"
                          required
                          onChange={(e) => (ref.current.password = e.target.value)}
                        />
                      </div>

                      <div className="space-x-3 text-center">
                        <button
                          className="rounded-3xl border border-orange-500 bg-orange-500  px-5 py-2  font-semibold text-white"
                          color="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? '注册中...' : '注册'}
                        </button>
                        <button
                          type="button"
                          className="rounded-3xl border border-orange-500  px-5 py-2  font-semibold text-orange-500"
                          onClick={closeModal}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </section>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
```

上面代码中使用 `useRef` 来存储表单数据，提交表单后，将返回的 `jwt` 存在 `sessionStorage` 中，我将 `user` 也存到了 `sessionStorage` 中，比较标准的做法是只存 `jwt`，用户信息通过`/api/users/me`接口获取。

### axios 封装

登录成功后，我们要实现发微博的功能

首先我们需要对 `axios` 封装一下，方便后续接口请求自动往 `http header` 中加入 `jwt` 信息，建一个 `lib/request.ts` 文件，代码如下

```ts
import axios, { AxiosRequestConfig } from 'axios'

export const request = axios.create({
  timeout: 5000,
})

request.interceptors.request.use(function (config: AxiosRequestConfig) {
  //比如是否需要设置 token
  const jwt = window.sessionStorage.getItem('jwt')
  if (jwt) {
    config!.headers!.Authorization = 'Bearer ' + jwt
  }
  console.log(config)

  return config
})
```

### 图片上传

浏览器默认的文件选择 `input` 样式很丑， [tailwindcss](https://tailwindcss.com/docs/hover-focus-and-other-states#file-input-buttons) 对它做了专门的样式优化，我们只需要拷贝 HTML， 就可以写出比较美观的文件上传组件。

![tailwindcss  上传组件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b4889aff2dd41e48048e7bd4bdccab2~tplv-k3u1fbpfcp-zoom-1.image)

上传接口

```ts
export const upload = async (files: File[]) => {
  const formData = new FormData()

  Array.from(files).forEach((file: any) => {
    formData.append('files', file, file.name)
  })
  const res = await request.post('/api/upload', formData)
  return res.data
}
```

input `onChange` 方法，将上传的返回地址存放在 `state` 中，用于后续发微博接口中的 images 字段，并且将选择的文件清空。

```
interface ImageData {
  id: number;
  url: string;
}

const [images, setImages] = useState<ImageData[]>([]);

const handleFileChange = async (e: any) => {
    const files = e.target.files;
    const res = (await upload(files)) as any;
    setImages(res);
    e.target.value = "";
  };
```

### 发微博

接下来我们将发微博的逻辑封装成一个 `SendMessage` 组件，当前在哪个话题`topic`下发，发送人`user`是谁? 这些都不是当前组件的逻辑，所以可以使用 `props` 传入即可。

组件 HTML 结构：

```ts
import React, { useRef, useState } from 'react'
import { User } from '../types/user'

type Props = {
  callBack: () => {}
  topicId: number
  user: User
}

export default function SendMessage({ callBack, user, topicId }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendMesage = async () => {}

  return (
    <div className="rounded-sm bg-white p-3 shadow-sm">
      <textarea className="w-full border p-3" ref={ref} rows={4}></textarea>
      <div className="flex items-center justify-between">
        <span>
          <button
            onClick={handleSendMesage}
            type="button"
            disabled={loading}
            className="rounded border border-orange-500 bg-orange-500  px-3 py-1  font-semibold text-white"
          >
            发送
          </button>
        </span>
      </div>
    </div>
  )
}
```

发送接口与逻辑：

```ts
export function sendMessage(data: any) {
  return request.post('/api/messages', { data })
}

const handleSendMesage = async () => {
  if (ref.current && ref.current.value) {
    setLoading(true)
    try {
      await sendMessage({
        content: ref.current.value,
        images: images.map((m) => m.id),
        user: user.id,
        topic: topicId,
      })
      setLoading(false)
      ref.current.value = ''
      setImages([])
      callBack()
    } catch (error) {
      setLoading(false)
    }
  }
}
```

这里需要注意的是，关联对象的保存，我们只需要传入 `id` 就可以，比如关联的图片 `images` ，我们只需要传入一个 id 数组。

### 联表查询

接下来，我们需要实现微博列表，当我们请求接口时候返回的接口如下：

![聊表查询失败](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eee904185d6e46798929d4ce6e98df45~tplv-k3u1fbpfcp-zoom-1.image)

接口中只返回了 `content` 字段，并没有 `user` 和 `images` 等信息，那么该如何通过接口实现联表查询呢？

遇到问题不用慌，先看下[文档](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html#relation-media-fields)，上面清楚地记录了 Rest API 关联关系查询的方式，在 url 上加参数`?populate=*`，意思是:将所有关联关系都填充，若我们只想看看这条微博是谁发送的，只需要改成具体的参数字段：

```bash
http://localhost:3000/api/messages?populate=user
```

接口请求返回结果如下：

![聊表查询成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb6da9b9fd174a05843937acbcd362f7~tplv-k3u1fbpfcp-zoom-1.image)

## 最终效果

![实现简易微博效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf190d4adbc7479ca836a9ed29399c90~tplv-k3u1fbpfcp-zoom-1.image)

到此，我相信你对 strapi 有了一定了解，并且可以通过 next.js 实现微博列表，联调查询等功能，若还是不清楚，可以直接看我的[源码](https://github.com/maqi1520/strapi-weibo '源码')

## 小结

本文主要介绍了使用 strapi 和 Next.js 实现了一个简易的微博，我们不必写后端，只需要后台配置便可以创建 api 接口，通过本文，我相信你对 strapi 有了一定了解，但 strapi 除了 Rest API，还有 ：

- GraphQL API，前端可以直接使用 GraphQL 查询语言
- Query Engine API 直接操作数据库层来实现功能
- Entity Service API 复杂数据结构查询

通过 Query Engine API 和 Entity Service API 实现自定义接口。

## 后续

接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

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
