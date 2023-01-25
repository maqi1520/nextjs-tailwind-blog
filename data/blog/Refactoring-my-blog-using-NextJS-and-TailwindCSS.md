---
title: '使用 NextJS 和 TailwindCSS 重构我的博客'
date: '2021/7/13'
lastmod: '2021/7/13'
tags: [React.js, 前端]
draft: false
summary: '这是笔者第三次重构博客应用。本文主要是笔者记录重构博客所用的知识和记录，希望以后每周或者每两周能够有一篇文章，记录和总结知识。'
images: ['']
authors: ['default']
layout: PostLayout
---

- [git 地址](https://github.com/maqi1520/nextjs-tailwind-blog)
- [在线地址](http://maqib.cn/)

这是笔者第三次重构博客，虽然博客应用是最简单的应用，但学习新技术何不从重构博客开始？

- 第一版：使用 Hexo 和 Github pages

  - 优点：重新部署只要花 5 分钟，内容管理在本地 纯静态、免费；

  - 缺点：依赖 Github，国内访问困难；

- 第二版：React + Antd + Mysql 服务器是阿里云 ESC 最低配

  - 优点： 感觉没什么优点；

  - 缺点： 浏览器渲染，搜索引擎无法收录 ESO 优化难，Antd 组件使用方便，但前台页面定制需要覆盖样式；

- 第三版：NextJS + TailwindCSS + Postgresql

  - 优点： 服务端渲染（SSR) + 静态生成， 访问速度极快，全新 UI 支持换肤；

## TailwindCSS

在国外如火如荼，但是在国内却很少看到在生产上应用，对我来说， TailwindCSS 不仅仅是一个原子类的超级样式库；

1、我们在写样式的时候，经常会写类名，团队成员之间会存在样式冲突的可能，虽然我们可以使用 css modules 来避免，但却会存在取类名称的疲劳的问题，重复的类名称 `-header,-body -container --wrapper`等；

2、Utility-First： 默认采用 rem 单位， 变量也就是 16 的倍数， `px-1`是 16 的 `1/4` 也就是 4 px，我们不会写出 13px、17px 等不统一的单位变量，正所谓失之毫厘，差之千里。 配合 [VScode 插件](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)， 我们可以根据提示实时看到实际单位数值，写出高度还原高保真的样式；

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd54b2ba6cb244cbb930ab82b8521e1b~tplv-k3u1fbpfcp-watermark.image)

3、jwt 模式： just-in-time 模式，可以写出在原子类之外的样式，比如: `w-[762px]`表示`width:762px`, `grid-cols-[1fr,700px,2fr]` 表示`grid-template-columns: 1fr 700px 2fr;` 当然还有`h-[calc(1000px-4rem)]`等等，这些都是运行时才生成的样式；配合在`tailwind.config.js` 中加入`purge: ['./src/**/*.{js,ts,jsx,tsx}']`打包时只会提取使用到的样式，让应用 css 最小化。

4、之前写了[《使用 CSS variables 和 Tailwind css 实现主题换肤》](https://juejin.cn/post/6971708936734900254)也运用到了我的博客中。

## Next.js

next.js 是一个 react 服务端渲染框架，相比 react 单页应用，网络爬虫可以识别 HTML 语义标签，更有利于 SEO。

接下来介绍下 NextJS 主要 API：

### getServerSideProps 服务端渲染

下面是最简单的客户端渲染代码

```tsx
import React, { ReactElement, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Post(): ReactElement {
  let { slug } = useParams()
  const [post, setPost] = useState({
    title: '',
    content: '',
  })
  useEffect(() => {
    fetch(`/api/post/${slug}`)
      .then((res) => res.json())
      .then((res) => {
        setPost(res)
      })
  }, [])
  return (
    <>
      <h1>{post.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: post.content,
        }}
      ></div>
    </>
  )
}
```

改成 NextJS 后的代码如下

```tsx
// pgaes/blog/[slug].tsx
import React, { ReactElement } from 'react'

export default function Post({ post }): ReactElement {
  return (
    <>
      <h1>{post.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: post.content,
        }}
      ></div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const res = await fetch(`https://.../api/post/${slug}`)
  const post = await res.json()

  return {
    props: {
      post,
    },
  }
}
```

`getServerSideProps` 是在 node 端处理，每个 request 请求时执行。

而文章内容写完之后是通常不变的，所以可以先将页面静态存储在服务器上，这样就可以大大减小数据库压力。

### getStaticProps 在构建时请求数据。

```jsx
export async function getStaticProps(context) {
  // fetch data
  return {
    props: {
      //data
    },
  }
}
```

这样就需要在构建时获取全部文章列表，而博客详情页是一个动态路由，就需要 `getStaticPaths` 这个 API

### getStaticPaths 构建时获取动态路由的数据

```js
export async function async getStaticPaths() {
   const slugs= await getAllSlugs()
  return {
    paths: slugs.map(slug=>({
        params:slug
    })),
    fallback: true //or false
  };
}
```

当网站构建后，新写的文章也需要生成静态页面，这时就可以将`fallback` 设置为 true， 如果设为 false，则在构建之外的文章都将返回 404 页面。

下面是文章详情页的主体代码

```jsx
// pages/posts/[slug].js
import { useRouter } from 'next/router'

function Post({ post }) {
  const router = useRouter()

  // 如果页面还没静态生成，则先显示下面的loading
  // 直到 `getStaticProps()`运行完成
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // Render post...
}

// 在构建时运行，获取全部文章路径
export async function getStaticPaths() {
  return {
    // 在打包时值生成 `/posts/1` 和 `/posts/2` 的静态页面
    paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
    // 开启其他页面的静态生成
    // For example: `/posts/3`
    fallback: true,
  }
}

// 在构建时运行，根据params中的id 获取文章详情
export async function getStaticProps({ params }) {
  // 如果页面的路由是 /posts/1, 这 params.id 的值就是1
  const res = await fetch(`https://.../posts/${params.id}`)
  const post = await res.json()

  // 把数据专递给页面的props
  return {
    props: { post },
    //当请求进入的时候再次生成文章详情页，比如修改文章重新生成
    // 1s 内最多生成1次
    revalidate: 1,
  }
}

export default Post
```

## prisma —— 下一代 ORM 框架

Nodejs 框架访问数据库，往往会需要一个 ORM 框架来帮我们管理数据层代码，而在 Node.js 社区中，sequelize、TypeORM 等框架都被广泛应用，而 prisma 却是一个新秀。

Prisma 支持 Mysql、Postgresql 和 Sqlite， 访问官网我们可以很容易的上手，也可以快速的从老项目接入

虽然 Prisma 和 TypeORM 解决了类似的问题，但它们的工作方式却大相径庭。

### 与 TypeORM 对比

[TypeORM](https://typeorm.io/) 是一种传统的 ORM，它将表映射到模型类。这些模型类可用于生成 SQL 迁移。然后，模型类的实例在运行时为应用程序的 CRUD 查询提供一个接口。

[Prisma](https://www.prisma.io/) 是一种新的 ORM，它缓解了传统 ORM 的许多问题，例如: 模型实例的膨胀、业务与存储逻辑的混合、缺乏类型安全性或由延迟加载引起的不可预测查询。

它使用 Prisma Schema，以声明的方式定义应用程序模型。然后使用 `Prisma Migrate `命令， Prisma Schema 会生成 SQL 迁移并根据数据库执行它们。Prisma CRUD 查询由 Prisma Client 提供，这是一个针对 Node.js 和 TypeScript 的轻量级且完全类型安全的数据库客户端。

对比下二者代码

1. **Prisma Schema**

```js
model User {
  id      Int      @id @default(autoincrement())
  name    String?
  email   String   @unique
  posts   Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int?
  author    User?   @relation(fields: [authorId], references: [id])
}
```

Schema 是一个描述文件，描述了数据模型直接的关系，再通过`prisma generate` 生成 typescript 声明文件。

2. **TypeORM Entity**

```js
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  name: string

  @Column({ unique: true })
  email: string

  @OneToMany((type) => Post, (post) => post.author)
  posts: Post[]
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ nullable: true })
  content: string

  @Column({ default: false })
  published: boolean

  @ManyToOne((type) => User, (user) => user.posts)
  author: User
}
```

Entity 是在运行时，代码通过`@Entity()`来实现 JavaScript 类的继承。

### **过滤**

1. Prisma

```js
const posts = await postRepository.find({
  where: {
    title: { contains: 'Hello World' },
  },
})
```

2. TypeORM

```js
const posts = await postRepository.find({
  where: {
    title: ILike('%Hello World%'),
  },
})
```

### 多对多关系级联操作

1. Prisma

```ts
type Categories = {
  id?: number
  name: string
  createdAt?: Date | null
}[]

type PostBody = Post & {
  categories: Categories
}

const { title, summary, slug, content, published, categories } = req.body as PostBody

const connectOrCreate = categories.map(({ name }) => {
  return {
    create: {
      name,
    },
    where: {
      name,
    },
  }
})
const newPost = await prisma.post.create({
  data: {
    title,
    summary,
    slug,
    content,
    published,
    categories: {
      connectOrCreate,
    },
    user: {
      connect: {
        id: req.user.id,
      },
    },
  },
  include: {
    categories: true,
  },
})
```

文章和分类是多对多的关系，一篇文章可以有多个分类，一个分类下可以有多篇文章，

`categories` 可以选择已经存在的分类，也可以是新加的分类,通过`name`唯一熟悉来判断是否要新增还是级联。

2. TypeORM

```ts
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsNotEmpty()
  title: string

  @Column({
    select: false,
    type: 'text',
  })
  content: string

  @ManyToMany((type) => Category, {
    cascade: true, //级联插入修改  boolean | ("insert" | "update" | "remove" | "soft-remove" | "recover")[]
  })
  @JoinTable()
  categories: Category[]
}

const newPost = postRepository.create({
  ...ctx.request.body,
})
```

typeorm 通过`cascade` 属性 就可以级联增、删、改 软删除 等

### Postgresql

本次重构还讲数据库迁移到了 Postgresql。

1、MySQL 里有只有 utf8mb4 才能显示 emoji 的坑, Pg 就没这个坑；

2、Pg 可以存储 array 和 json， 可以在 array 和 json 上建索引；

## 代码编辑器

从上一版是 [codemiror](https://codemirror.net/#features) 和 remark 自己写的组件 ，这一版发现掘金的 Markdown 编辑比较好用，就直接使用了[bytemd](https://github.com/bytedance/bytemd), 底层都是使用了 remark 和 [rehype](https://github.com/rehypejs/rehype)，支持任何框架，并且拥有丰富的插件，还是比较好用的，但是在文章详情页却没有单独的 TOC（目录）组件，得单独封装一个 TOC 组件了。

## 小结

本文主要是笔者记录重构博客所用的知识和记录，当然还有很多不足，也还有很多功能得开发，
比如：图床、评论、SEO 优化、 统计和监控等。

当然内容是最重要的，希望以后每周或者每两周能够有一篇文章，记录和总结知识。

喜欢的同学可以 fork 一下，免费部署到 [Heroku](https://heroku.com/) 中，Heroku 支持免费的 Postgresql 数据库，也可以将程序部署到 https://vercel.app/ （国内比较快，不支持数据库），数据库还是选择 Heroku。记得给一个小星 ✨ ！
