---
title: 使用 Next.js 搭建 Monorepo 组件库文档
date: 2022/11/23 00:59:38
lastmod: 2023/1/25 11:42:26
tags: [前端, React.js]
draft: false
summary: 本文，我们从零开始，使用 Next.js 和 pnpm 搭建了一个组件库文档，主要使用 Next.js 动态导入功能解决了开发服务缓慢的问题，使用 Next.js 的 SSG 模式来生成静态文档。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f99c63bee274496982410a51624c9069~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 阅读本文你将：

- 使用 pnpm 搭建一个 Monorepo 组件库
- 使用 Next.js 开发一个组件库文档
- changesets 来管理包的 version 和生成 changelog
- 使用 vercel 部署在线文档

代码仓库：https://github.com/maqi1520/nextjs-components-docs

## 前言

组件化开发是前端的基石，正因为组件化，前端得以百花齐放，百家争鸣。我们每天在项目中都写着各种各样的组件，如果在面试的时候，跟面试官说，你每天的工作是开发组件，那么显然这没有什么优势，如果你说，你开发了一个组件库，并且有一个在线文档可以直接预览，这可能会是你的一个加分项。今天我们就来聊聊组件库的开发，主要是组件库的搭建和文档建设，至于组件数量，那是时间问题，以及你是否有时间维护好这个组件库的问题。

## 基础组件和业务组件

首先组件库分为基础组件和业务组件，所谓基础组件就是 UI 组件，类似 Ant design，它是单包架构，所有的组件都是在一个包中，一旦其中一个组件有改动，就需要发整包。另外一种是业务组件，组件中包含了一些业务逻辑，它在企业内部是很有必要的。比如飞书文档，包含在线文档，在线 PPT、视频会议等，这些都是独立的产品，单独迭代开发，单独发布，却有一些共同的逻辑，比如没有登录的时候都需要调用一个”登录弹窗“，或者说在项目协同的时候，都需要邀请人员加入，那么需要一个“人员选择组件”， 这就是业务组件。业务组件不同于基础组件，单独安装，依赖发包，而并不是全量发包。那么这些业务组件也需要一个文档，因此我们使用 Monorepo（单仓库管理），这样方便管理和维护。

## 为什么选用 Next.js 来搭建组件库文档？

组件文档有个特别重要的功能就是“写 markdown 文档，可以看到代码以及运行效果”，这方面有很多优秀的开源库，比如 Ant design 使用的是 [bisheng](https://github.com/benjycui/bisheng 'bisheng')， react use 使用的是 [storybook](https://github.com/storybookjs/storybook 'storybook')， 还有一些优秀的库，比如：[dumi](https://github.com/umijs/dumi 'dumi')，[Docz](https://github.com/doczjs/docz 'docz') 等。 本地跑过 Ant design 的同学都知道， Ant design 的启动速度非常慢，因为底层使用的 webpack，要启动开发服务器，必须将所有组件都进行编译，这会对开发者造成一些困扰，因为如果是业务组件的话，开发者只关注单个组件，而不是全部组件。而使用 Next.jz 就有 2 个非常大的优势：

- 使用 swc 编译，Next.js 中实现了快 3 倍的快速刷新和快 5 倍的构建速度；
- 按需编译，在开发环境下，只有访问的页面才会进行编译

那么接下来的问题就是：要在 Next.js 中实现 “写 Markdown Example 可预览”的功能，若要自己实现这个功能，确实是一件麻烦的事情。我们换一个思维，组件展示，也就是在 markdown 中运行 react 组件，这不就是 [mdx](https://github.com/mdx-js/mdx 'mdx') 的功能吗？ 而在 Next.js 中可以很方便地集成 MDX。

## 效果演示  

![实现效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5dc62765c903439ea4654ef5f1dcd646~tplv-k3u1fbpfcp-zoom-1.image)

目前这是一个简易版，只为展示 Next.js 搭建文档

## 项目初始化

首先我们创建一个 next typescript 作为我们项目的主目录，用于组件库的文档开发

```
npx create-next-app@latest --ts
```

要想启动 pnpm 的 workspace 功能，需要工程根目录下存在 `pnpm-workspace.yaml` 配置文件，并且在 `pnpm-workspace.yaml` 中指定工作空间的目录。比如这里我们所有的子包都是放在 packages 目录下

```
packages:
  - 'packages/*'
```

接下来，我们在 packages 文件夹下创建三个子项目，分别是：user-select、login 和 utils， 对应用户选择，登录 和工具类。

```
├── packages
│   ├── user-select
│   ├── login
│   ├── utils
```

user-select 和 login 依赖 utils，我们可以将一些公用方法放到 utils 中。

给每个 package 下面创建 `package.json` 文件，包名称通常是”@命名空间+包名@“的方式，比如@vite/xx 或@babel/xx，在本例中，这里我们都以`@mastack`开头

```json
{
  "name": "@mastack/login",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

给每个 package 安装 typescript

```bash
pnpm add typescript -r  -D
```

给每个 package 创建 tsconfig.json 文件

```json
{
  "include": ["src/**/*"],
  "compilerOptions": {
    "jsx": "react",
    "outDir": "dist",
    "target": "ES2020",
    "module": "esnext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "declaration": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

执行下面代码，往 login 组件中安装 utils;

```bash
pnpm i @mastack/utils --filter @mastack/login
```

安装完成后，设置依赖版本的时候推荐用 `workspace:*`，就可以保持依赖的版本是工作空间里最新版本，不需要每次手动更新依赖版本。

pnpm 提供了 `-w`, `--workspace-root` 参数，可以将依赖包安装到工程的根目录下，作为所有 package 的公共依赖，这么我们安装 `antd`

```bash
pnpm install antd -w
```

## 组件开发

我们在 login 组件下，新建一个组件 `src/index.tsx`

```js
import React, { useState } from 'react'
import { Button, Modal } from 'antd'

interface Props {
  className: string;
}

export default function Login({ className }: Props) {
  const [open, setopen] = useState(false)
  return (
    <>
      <Button onClick={() => setopen(true)} className={className}>
        登录
      </Button>
      <Modal title="登录" open={open} onCancel={() => setopen(false)} onOk={() => setopen(false)}>
        <p>登录弹窗</p>
      </Modal>
    </>
  )
}
```

先写一个最简单版本，组件代码并不是最重要的，后续可以再优化。

在 package.json 中添加构建命令

```json
"scripts": {
    "build": "tsc"
  }
```

然后在组件目录下执行 `yarn build` 。此时组件以及可以打包成功！

## Next.js 支持 MDX

接下来要让文档支持 MDX，在根目录下执行以下命令，安装 mdx 和 loader 相关包

```
pnpm add @next/mdx @mdx-js/loader @mdx-js/react -w
```

修改 `next.config.js` 为以下代码

```js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  swcMinify: true,
})
```

这样就可以在 Next 中支持 MDX 了。

我们在 `src/pages` 目录下，新建一个 `docs/index.mdx`

![markdown 信息](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/47e827c0dfbb4623875c4b9e16206471~tplv-k3u1fbpfcp-zoom-1.image)

先写一个简单的 markdown 文件测试下

![markdown 渲染](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/30f3a4c0bcad4fe782d1fe0b5594d873~tplv-k3u1fbpfcp-zoom-1.image)

这样 Next.js 就支持 mdx 文档了。

## Next 动态加载 md 文件

接下来，我们要实现动态加载 packages 中的文件 md 文件。新建一个 `pages/docs/[...slug].tsx` 文件。

```ts
export async function getStaticPaths(context: GetStaticPathsContext) {
  return {
    paths: [{ params: { slug: ['login'] } }, { params: { slug: ['user-selecter'] } }],
    fallback: false, // SSG 模式
  }
}

export async function getStaticProps({ params }: GetStaticPropsContext<{ slug: string[] }>) {
  const slug = params?.slug.join('/')

  return {
    props: {
      slug,
    }, // 传递给组件的props
  }
}
```

我们使用的是 SSG 模式。上面代码中 `getStaticPaths` 我先写了 2 条数据，因为我们目前只有 2 个组件，它会在构建的时候会生成静态页面。 `getStaticProps`函数可以获取 URL 上的参数，我们将 slug 参数传递给组件，然后在 Page 函数中，我们使用 `next/dynamic` 动态加载 packages 中的 mdx 文件

```ts
import React from 'react'
import { GetStaticPathsContext, InferGetServerSidePropsType, GetStaticPropsContext } from 'next'
import dynamic from 'next/dynamic'

type Props = InferGetServerSidePropsType<typeof getStaticProps>

export default function Page({ slug }: Props) {
  const Content = dynamic(() => import(`../packages/${slug}/docs/index.mdx`), {
    ssr: false,
  })

  return (
    <div>
      <Content />
    </div>
  )
}
```

此时我们访问 `http://localhost:3000/docs/login` 查看效果

![Next.js 编译报错](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a084dc67f5f84f72b22af0c99e451d78~tplv-k3u1fbpfcp-zoom-1.image)

在页面上会提示，无法找到`@mastack/login` 这个包，我们需要在项目的根目录下的 `tsconfig.json` 中加入别名

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@mastack/login": ["packages/login/src"],
      "@mastack/user-select": ["packages/user-select/src"]
    }
  }
}
```

保存后，页面会自动刷新，我们就可以在页面上看到如下效果。

![Next.js  动态加载 mdx](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e97447d2968a46c89d1f63f1c9883d83~tplv-k3u1fbpfcp-zoom-1.image)

至此文档与 packages 目录下的 mdx 已经打通。修改 `packages/login/docs/index.mdx` 中的文档，页面会自动热更新。

## 自定义 mdx 组件

上面代码已经实现了在 md 文档中显示组件和代码，但我们想要的是类似于 ant design 那样的效果，默认代码不展示，点击可以收起和展开，这该怎么实现呢？

![ant design 代码块](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57b68b7a21b9461b8ba0b5f2a449900b~tplv-k3u1fbpfcp-zoom-1.image)

我们可以利用 mdx 的自定义组件来实现这个效果。

写 mdx 的时候，在组件 `<Login/>`和代码外层嵌套一个自定义组件`DemoBlock`

![markdown 信息](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21bc9aabd9644cfdada4b7dcbab8d052~tplv-k3u1fbpfcp-zoom-1.image)

然后实现一个自定义一个 `DemoBlock` 组件，提供给 `MDXProvider`，这样所有的 mdx 文档中，不需要 `import` 就可以使用组件。

```tsx
import dynamic from 'next/dynamic'
import { MDXProvider } from '@mdx-js/react'

const DemoBlock = ({ children }: any) => {
  console.log(children)
  return null
}

const components = {
  DemoBlock,
}

export default function Page({ slug }: Props) {
  const Content = dynamic(() => import(`packages/${slug}/docs/index.mdx`), {
    ssr: false,
  })

  return (
    <div>
      <MDXProvider components={components}>
        <Content />
      </MDXProvider>
    </div>
  )
}
```

我们先写一个空组件，看下 `children` 的值。刷新页面， 此时 `DemoBlock`中的组件和代码不会显示，我们看一下打印出的 `children` 节点信息；

![ DemoBlock children 节点数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f470e8ba82d4936a698d1b5be87f9ce~tplv-k3u1fbpfcp-zoom-1.image)

chilren 为 react 中的 vNode，现在我们就可以根据 type 来判断，返回不同的 jsx，这样就可以实现`DemoBlock`组件了，代码如下：

```tsx
import React, { useState } from 'react'

const DemoBlock = ({ children }: any) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="demo-block">
      {children.map((child: any) => {
        if (child.type === 'pre') {
          return (
            <div key={child.key}>
              <div className="demo-block-button" onClick={() => setVisible(!visible)}>
                {!visible ? '显示代码' : '收起代码'}
              </div>
              {visible && child}
            </div>
          )
        }
        return child
      })}
    </div>
  )
}
```

再给组件添加一些样式，给按钮添加一个 svg icon，一起来看下实现效果：

![组件文档 demo 效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6d414dd5ca94a93be1b07eb2f31d04c~tplv-k3u1fbpfcp-zoom-1.image)

是不是有跟 antd 的 demo block 有些相似了呢？ 若要显示更多字段和描述，我们可以修改组件代码，实现完全自定义。

## 优化文档界面

至此我们的文档，还是有些简陋，我们得优化下文档界面，让我们的界面显示更美观。

1. 安装并且初始化 tailwindcss

```
pnpm install -Dw tailwindcss postcss autoprefixer @tailwindcss/typography
pnpx tailwindcss init -p
```

修改 `globals.css` 为 tailwindcss 默认指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

修改 `tailwind.config.js` 配置文件，让我们的应用支持文章默认样式，并且在 md 和 mdx 文件中也可以写 tailwindcss

```js
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import("tailwindcss").Config } */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './packages/**/*.{md,mdx}',
  ],
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],
}
```

在 MDX Content 组件 外层可以加一个 `prose` class，这样我们的文档就有了默认好看文章样式了。

现在 md 文档功能还很薄弱，我们需要让它强大起来，我们先安装一些 markdown 常用的包

```bash
pnpm install remark-gfm remark-footnotes remark-math rehype-katex rehype-slug rehype-autolink-headings rehype-prism-plus -w
```

- `remark-gfm` 让 md 支持 GitHub Flavored Markdown （自动超链接链接文字、脚注、删除线、表格、任务列表）

- `remark-math` [rehype-katex](url) 支持数学公式
- `rehype-slug` [rehype-autolink-headings](url) 自动给标题加唯一 id
- `rehype-prism-plus` 支持代码高亮

修改 `next.config.js` 为 `next.config.mjs`，并输入以下代码

```js
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkFootnotes from 'remark-footnotes'
import remarkMath from 'remark-math'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'

import nextMDX from '@next/mdx'

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath, remarkGfm, [remarkFootnotes, { inlineNotes: true }]],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, [rehypePrismPlus, { ignoreMissing: true }]],
  },
})

export default withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  swcMinify: true,
})
```

我们在这里可以配置 remarkPlugins 和 rehypePlugins；

markdown 在编译过程中会涉及 3 种 ast 抽象语法树 ， remark 负责转换为 mdast，它可以操作 markdown 文件，比如让 markdown 支持更多格式（比如：公式、脚注、任务列表等），需要使用 remark 插件； rehype 负责转换为 hast ，它可以转换 html，比如给 标题加 id，给代码高亮， 这一步是在操作 HTML 后完成的。因此我们也可以自己写插件，具体写什么插件，就要看插件在哪个阶段运行。

最后我们到 github [prism-themes](https://github.com/PrismJS/prism-themes/blob/master/themes/prism-atom-dark.css) 中复制一份代码高亮的样式到我们的 css 文件中，一起来看下效果吧！

![组件文档代码高亮](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/958db388c7dc45728c2a8b16fd74d3a9~tplv-k3u1fbpfcp-zoom-1.image)

## 发布工作流

workspace 中的包版本管理是一个复杂的任务，pnpm 目前也并未提供内置的解决方案。pnpm 推荐了两个开源的版本控制工具：changesets 和 rush，这里我采用了 [changesets](https://github.com/changesets/changesets 'changesets') 来实现依赖包的管理。

### 配置

要在 pnpm 工作空间上配置 changesets，请将 changesets 作为开发依赖项安装在工作空间的根目录中：

```
pnpm add -Dw @changesets/cli
```

然后 changesets 的初始化命令：

```
pnpm changeset init
```

### 添加新的 changesets

要生成新的 changesets，请在仓库的根目录中执行`pnpm changeset`。 `.changeset` 目录中生成的 markdown 文件需要被提交到到仓库。

### 发布变更

为了方便所有包的发布过程，在工程根目录下的 pacakge.json 的 scripts 中增加如下几条脚本：

```json
"compile": "pnpm --filter=@mastack/* run build",
"pub": "pnpm compile && pnpm --recursive --registry https://registry.npmjs.org/ publish --access public"
```

编译阶段，生成构建产物

1. 运行`pnpm changeset version`。 这将提高先前使用 `pnpm changeset` （以及它们的任何依赖项）的版本，并更新变更日志文件。
2. 运行 `pnpm install`。 这将更新锁文件并重新构建包。
3. 提交更改。
4. 运行 `pnpm pub`。 此命令将发布所有包含被更新版本且尚未出现在包注册源中的包。

## 部署

部署可以选择 gitbub pages 或者 vercel 部署，他们都是免费的，Github pages 只支持静态网站，vercel 支持动态网站，它会将 nextjs page 中，单独部署成函数的形式。我这里选择使用 vercel，因为它的访问速度相对比 gitbub pages 要快很多。只需要使用 github 账号登录 https://vercel.com/ 导入项目，便会自动部署，而且会自动分配一个 https://xxx.vercel.app/ 二级域名。

也可以使用命令行工具，在项目跟目录下执行，根据提示，选择默认即可

```bash
npx vercel
```

![vercel 部署](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db59465d9a384b158955a2ed1e69b25d~tplv-k3u1fbpfcp-zoom-1.image)

预览地址：https://nextjs-components-docs.vercel.app/

## 小结

本文，我们从零开始，使用 Next.js 和 pnpm 搭建了一个组件库文档，主要使用 Next.js 动态导入功能解决了开发服务缓慢的问题，使用 Next.js 的 SSG 模式来生成静态文档。最后我们使用 changesets 来管理包的 version 和生成 changelog。

好了，以上就是本文的全部内容，你学会了吗？接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《 Next.js 全栈开发实战》 专栏，感谢您的阅读。
