---
title: Shadcn UI 现代 UI 组件库
date: 2023/11/15 21:17:55
lastmod: 2024/5/19 21:24:10
tags: [JavaScript, React.js]
draft: false
summary: Shadcn UI 现代 UI 组件库 前言 不知道大家是否使用过 Shadcn UI，它在Github 上拥有了 35k star，它与大多数 UI 组件库(如 Ant desgin 和 Chakr
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e24919ee73e34d079b4696987938523c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3014&h=1714&s=781239&e=png&b=0b0b0d',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

不知道大家是否使用过 Shadcn UI，它在[Github](https://github.com/shadcn-ui/ui) 上拥有了 35k star，它与大多数 UI 组件库(如 Ant desgin 和 Chakra UI)不同，一般组件库都是通过 npm 的方式给项目使用，代码都是存在 `node_modules` 中，而 Shadcn UI 可以将单个 UI 组件的源代码下载到项目源代码中（src 目录下），开发者可以自由的修改和使用想要的 UI 组件，它已经被一些知名的网站（[vercel.com](https://vercel.com/)、[bestofjs.org](https://bestofjs.org/)）等使用。那么它到底有什么优势呢？ 一起来来探讨下。

## Shadcn UI 介绍

Shadcn UI 实际上并不是组件库或 UI 框架。相反，它是可以根据文档“让我们复制并粘贴到应用程序中的可复用组件的集合”。它是由 vercel 的工程师[Shadcn](https://twitter.com/shadcn)创建的，他还创建了一些知名的开源项目，如 [Taxonomy](https://vercel.com/templates/next.js/taxonomy)，[Next.js for Drupal](https://next-drupal.org/)和[Reflexjs](https://reflexjs.org/)。

Radix UI - 是一个无头 UI 库。也就是说，它有组件 API，但没有样式。Shadcn UI 建立在 Tailwind CSS 和 Radix UI 之上，目前支持 Next.js、Gatsby、Remix、Astro、Laravel 和 Vite，并且拥有与其他项目快速集成的能力——[安装指南](https://ui.shadcn.com/docs/installation/manual)。

## Shadcn UI 功能特点

### 多主题和主题编辑器

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4883667e8bc74325a211636668b68f75~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=690&h=388&s=1613672&e=gif&f=172&b=030510)

在 Shadcn UI 的官网上有一个主题编辑器，我们可以点击 `Customize` 按钮实时切换风格和主题颜色，设计完成后，我们只需要拷贝 css 主要变量到我们的程序中即可。 下图是需要拷贝的 css 颜色变量。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c206429a817743dcbe6a168788c93e91~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1012&h=1070&s=381387&e=png&b=09090b)

颜色使用 hls 表示，主题变量分为背景色（background） 和 前景色（foreground），Shadcn UI 约定 css 变量省略 background，比如 `--card` 就是表示的是 card 组件的背景颜色。

### 深色模式

可以看到复制的 css 变量支持生成深色模式，如果你使用 react， 可以使用 [next-themes](https://github.com/pacocoursey/next-themes)，这个包来实现主题切换，当然也可以通过 js 在 html 上切换 dark 这个样式来实现。 除了 react 版，社区还自发实现了 [vue](https://www.shadcn-vue.com/) 和 [svelte](https://www.shadcn-svelte.com/) 版本

### CLI

除了手动从文档中复制组件代码到项目中，还可以使用 cli 来自动生成代码

- 初始化配置

```bash
npx shadcn-ui@latest init
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e4f70aeb84b49c59e227638af0e4f5f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1388&h=584&s=366378&e=png&b=010101)

- 添加组件

```bash
npx shadcn-ui@latest add
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10154315b60c4a8a877aff8cb15b4680~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1614&h=586&s=202441&e=png&b=000000)

按空格选择想要的组件，按回车就会下载选中的 UI 组件代码

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40087275c72b452a810b2f61813c5967~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1058&h=280&s=90516&e=png&b=000000)

下载的源码在 `components/ui` 目录下，并且自动安装 Radix UI 对应的组件。

### 丰富的组件库

Shadcn UI 拥有丰富的组件，包括 常见的 Form、 Table、 Tab 等 40+ 组件。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2c108ed421845049ee0c5abdd2d8dbe~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2686&h=1378&s=750189&e=png&b=ffffff)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b7d7918343f49fa9f229e3d6f443e92~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2676&h=1148&s=706659&e=png&b=ffffff)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b63cd210122844999e0672a436e645b7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=888&h=820&s=179686&e=png&b=ffffff)

## 使用 Shadcn UI 创建登录表单

接下来我们一起实战下，使用 Shadcn UI 创建登录表单， 由于 Shadcn UI 是一个纯 UI 组件，对于复杂的表单，我们还需要使用 react-hook-form 和 zod。

首先下载 UI

```bash
npx shadcn-ui@latest add form
```

安装 react-hook-form 以及 zod 验证相关的包

```bash
yarn add add react-hook-form zod @hookform/resolvers
```

zod 用于格式验证

下面代码是最基本的 Form 结构

```js
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
;<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="shadcn" {...field} />
      </FormControl>
      <FormDescription>This is your public display name.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

- `FormField` 用于生成受控的表单字段
- `FormMessage` 显示表单错误信息

### 登录表单代码

```js
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: z.string({ required_error: '不能为空' }).min(6, {
    message: '密码必须大于6位',
  }),
})

export default function ProfileForm() {
  // 1. Define your form.
  const form =
    useForm <
    z.infer <
    typeof formSchema >>
      {
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: '',
        },
      }

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto mt-10 w-80 space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="请输入邮箱" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input placeholder="请输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登录</Button>
      </form>
    </Form>
  )
}
```

展示效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/98033db44c02431dbd5987fb3dd198db~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=634&h=406&s=55832&e=png&b=ffffff)

## 小结

与其他组件库相比，Shadcn UI 提供了几个好处。

- 易用性：使用复制和粘贴或 CLI 安装方法可以轻松访问其组件.
- 可访问性：Shadcn UI 的组件是完全可访问的，并符合 Web 内容可访问性指南 （WCAG） 标准，它支持屏幕阅读器、键盘导航和其他辅助设备。
- 灵活和可扩展性：Shadcn UI 只会下载需要使用的组件在源码中，并且开发者可以灵活定制和修改。

当然需要手动拷贝安装每一个组件可能是一件麻烦的事情，这也会导致源码量的增加，因此是否使用 Shadcn UI 还得开发者自行决定，总的来说 Shadcn UI，我还是非常看好，我将配合 next.js 在一些新项目中使用。
