---
title: 使用 Next.js、 Prisma 和 PostgreSQL 全栈开发视频网站
date: 2022/10/11 23:57:14
lastmod: 2023/1/25 11:42:57
tags: [前端, React.js]
draft: false
summary: 本文将以实现一个视频网站为例，介绍 Next.js 和 Prisma 开发的全过程，prisma 对于 Next.js 来说，可谓是如虎添翼，有了它们，我们前端工程师轻松步入了全栈开发。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f670f626e68949df8f2a0479c8ac3833~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

highlight: monokai
theme: vuepress

---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

在前面的文章中，我们使用了 Notion 笔记作为数据库和 Next.js 开发了一个面试刷题网站，也结合了 Strapi 这款无头 CMS 系统开发了一个微博应用，Strapi 默认使用的 SQLite，SQLite 是一个基于文件的嵌入式关系数据库系统，优点是精巧、单机部署以及方便的可移植性，但缺点也是因为文件系统本身的限制，可能会在较大数据集的情况下导致性能问题。今天我们来使用另一款关系型数据库 PostgreSQL，可以轻松应对大数据集的场景，并且直接支持 JSON 数据类型存储，也是企业应用程序中最受欢迎的数据库之一，然后配合当下非常流行的 Nodejs ORM 框架 Prisma ，让 Next.js 全栈开发变得更加简单！

本文将以实现一个视频网站为例，介绍 Next.js 和 Prisma 开发的全过程。

## 阅读本文，你将收获：

- 如何使用 Docker 启一个数据库服务
- 如何使用 Prisma Schema 管理数据表
- 如何在 Next.js 中调用 Prisma 查询语句

文中涉及代码全部托管在 [GitHub 仓库](https://github.com/maqi1520/next-prisma-video-app 'GitHub 仓库代码')中。

## 初始化项目

首先，我们使用 create-next-app 创建一个 Next.js Typescript 工程，并且安装和初始化 Tailwindcss

```bash
yarn create next-prisma-video-app --typescript
cd next-prisma-video-app
yarn add tailwindcss postcss autoprefixer --dev
npx tailwindcss init -p
```

修改 `globals.css` 为 `tailwindcss` 默认指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

运行 `yarn dev` 进入开发模式，修改页面浏览器会自动热更新，至此我们的前端工程初始化完成。

## 开发环境

接下来，先来说明下本项目涉及到的开发环境

- 安装 Docker 或 PostgreSQL。
- VSCode 安装了 Prisma 扩展。

### 安装 Docker

> 提示：如果您不想使用 Docker，可以在本地安装 PostgreSQL 实例或者使用云服务商提供的 PostgreSQL 数据库。

前端同学，一般不会在自己的电脑上数据库，不同环境下安装数据库可能会是一个麻烦的过程，我们可以先安装 Docker，通过 Docker 安装一个数据库会变的非常简单。

没有 Docker 的同学先通过 [docker 官网](https://www.docker.com/ 'docker 官网')安装 Docker。

默认情况下，windows 和 mac 下的 Docker 已经自带了`docker-compose` 工具，可以使用 `docker-compose -v` 命令查看。

### 创建 PostgreSQL 实例

下面我们将通过 Docker 容器在您的机器上安装和运行 PostgreSQL。

首先，在项目的根文件夹中创建一个`docker-compose.yml`文件：

```bash
touch docker-compose.yml
```

`docker-compose.yml` 文件是一个 docker 容器的规范配置文件，包含了 PostgreSQL 初始化设置。在文件中输入以下配置：

```yml
# docker-compose.yml
version: '3.1'
services:
  db:
    image: postgres
    volumes:
      - ./postgres:/var/lib/postgresql/data
    restart: always
    ports:
      - 5432:5432
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
```

上面 yml 文件中，我们初始化了 2 个服务：

一个是 `postgres` 对应 5432 端口，volumes 卷代表文件映射，将容器中的数据库映射到当前主机，避免容器服务销毁的时候数据库丢失。

另一个 `adminer` 是一个轻量的数据库管理客户端，支持多种关系型数据库，启动在 8080 端口。

在启动之前请确保 5432 端口和 8080 端不被占用，在命令行中输入以下命令启动服务：

```bash
docker-compose up -d
```

`-d`参数可以确保你关闭命令行窗口，docker 服务不被停止。

此时访问 `http://localhost:8080/` 便可以使用可视化页面访问 postgres 数据库了。

输入你设置的用户名和密码便可以看到以下界面

![Adminer PostgreSQL 管理界面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34ab754a8c594147ab5b45e633c497ad~tplv-k3u1fbpfcp-zoom-1.image)

当然你若不想使用数据的时候，也可以使用以下命令停止 docker 服务。

```bash
docker-compose down
```

停止后，数据库数据不会丢失，因为它存在同目录下的 postgres 目录中，下次启动便可以恢复数据。

## 需求分析

简单概括下需求，我们要实现的视频网站有的类似 B 站或者说是慕课网。

1. 至少 1 个列表页和一个视频详情页面
2. 每个视频必须有一个分类
3. 每个视频必须有一个作者
4. 每个视频可以分为多个章节

## 数据实体关系图

![数据实体关系图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/58c9e5f1fa964102a56c2f925a88ac39~tplv-k3u1fbpfcp-zoom-1.image)

1. 一个作者可以创建多个视频：一对多
2. 一个分类下可以有多个视频，但一个视频只能属于一个分类： 一个作者可以创建多个视频：一对多
3. 一个视频可以有多个章节：一对多

现在数据库和前端项目已经准备好了，是时候设置 Prisma 了！

## 初始化 Prisma

首先，首先安装 Prisma CLI 作为开发依赖项。

```bash
yarn add -D prisma
```

你可以通过运行以下命令在项目中初始化 Prisma：

```
npx prisma init
```

这一步创建了一个 prisma 目录包含了 `schema.prisma` 文件，该文件是数据库模型的主要配置文件。此命令还会在项目中创建一个`.env` 文件。

### 设置环境变量

在`.env`文件中，你会看到一个`DATABASE_URL`环境变量，将此字符串中的数据库连接信息替换为你刚才创建的 PostgreSQL 实例信息。

```
// .env
DATABASE_URL="postgres://myuser:mypassword@localhost:5432/median-db"
```

### 了解 Prisma schema

Prisma Schema 可以让我们更加直观的管理数据表，当我们的数据表有改动时，可以根据 Schema 自动生成 SQl，告别编写 SQl 迁移的烦恼，[prisma 官网](https://www.prisma.io/migrate 'prisma 官网')也直观地展示了 Schem 与 Sql 的关系。

![prisma 官网演示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/798b63422b6449a882c9a16d16bfa8ff~tplv-k3u1fbpfcp-zoom-1.image)

打开`prisma/schema.prisma`，你会看到以下默认代码：

```js
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

该文件是用 `Prisma Schema Language`编写的，这是 Prisma 用来定义数据库模式的语言。该文件包含三个主要组成部分：

- datasource：定义数据库类型和链接地址
- generator：指定哪个客户端向数据发送查询语言
- model：定义数据库 Schema。每个 Model 都将映射到数据库底层中的一个表中。目前，我们还没有 model，接下来我们来定义下 model。

## 对数据建模

工欲善其事必先利其器，在 VSCode 中安装了 [Prisma 扩展](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma 'Prisma 扩展')，可以让 VSCode 对 Prisma Schema 有语法高亮和输入提示。

```js
model Video {
  id         Int       @id @default(autoincrement())
  title      String    @unique
  desc       String?
  pic        String
  authorId   Int
  author     User?     @relation(fields: [authorId], references: [id])
  categoryId Int
  category   Category? @relation(fields: [categoryId], references: [id])
  level      Int       @default(1)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  chapter    Chapter[]
}

model Category {
  id    Int     @id @default(autoincrement())
  name  String  @unique
  video Video[]
}

model Chapter {
  id      Int    @id @default(autoincrement())
  title   String
  url     String
  videoId Int
  video   Video? @relation(fields: [videoId], references: [id])
}

model User {
  id     Int     @id @default(autoincrement())
  avatar String
  name   String
  video  Video[]
}
```

这里创建了 4 个 Model，`Video`、`Category`、`Chapter`、`User` 分别对应数据库中的表。每个 Model 中的一行代表一个字段，第一个是名称（如：`id`、`title`）、第二个是类型（如：`Int`、`String`）和其他可选属性（如：`@id`、`@unique`）。在字段类型后面添加一个`?`来使字段成为可选。

属性`@id`表示该字段是模型的主键。`@default(autoincrement())`属性表示该字段应自动递增

`@relation` 表示给表创建关联，比如 `video Video? @relation(fields: [videoId], references: [id])`表示使用`videoId` 为附键，关联 `Video` 表中的主键 `id`,

当我们保存时，vscode 会自动给"被关联的表"添加字段`video Video[]` ，并且自动格式化，让表之间的关系一目了然。

## 迁移数据库

定义 Prisma Schema 后，数据库中还没有真正的表，所以我们要执行一次 migrate(迁移)，第一次迁移，请在终端中运行以下命令：

```
npx prisma migrate dev --name "init"
```

这个命令会做三件事：

- 保存迁移 SQL：Prisma Migrate 将根据 Schema 自动生成所需的 SQL 语句，并且将生成的 SQL 语句保存到新创建的`prisma/migrations`文件夹中。
- 执行迁移：Prisma Migrate 将执行迁移文件中的 SQL 语句，在数据库中创建基础表。
- 安装 `@prisma/client`：由于我们没有安装客户端库，因此 CLI 会帮我们安装它。执行完成后，我们可以在 `package.json` 中看到安装的 `@prisma/client` 包，我们将用它向数据库发送查询。

执行成功后我们可以在命令行中看到以下提示

![Prisma 迁移成功生成SQL](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8f25195fe2f4c5cafafe3efd1144c6f~tplv-k3u1fbpfcp-zoom-1.image)

我们也可以查看 `prisma/migrations` 文件夹中的文件，了解底层执行的 SQL 语句，下面便是第一次执行后生成的 SQL。

![Prisma 生成的SQL](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d15216ae5da24482aa29c6c6033bd4f5~tplv-k3u1fbpfcp-zoom-1.image)

此时我发现设计数据库时，少加了一个字段，每个章节的视频少加了一个封面字段，没关系，我们可以直接修改 Schema。

```diff-js
model Chapter {
   id      Int    @id @default(autoincrement())
   title   String
+  cover   String
   url     String
   videoId Int
   video   Video? @relation(fields: [videoId], references: [id])
}
```

再次执行`prisma migrate dev --name added_cover`, 数据库中便会同步该字段，
`prisma/migrations` 文件夹下便会多一个 SQL 文件。

```sql
-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "cover" TEXT NOT NULL;
```

如果在生产环境中，变动数据库结构，我们需要将这些生成的 SQL 文件提交到 git 中。在代码部署前执行`npx prisma migrate deploy` 来应用这些 SQL 的改动。

## 为数据库播种数据

到目前为止，数据库还是为空的，因此，我们需要创建一个种子脚本，填充一些初始数据进入数据库，有些初始数据是程序必不可少的，比如货币语言信息等，有时候开发需要重置数据库，因此为数据库播种也很有必要。

首先，创建一个名为`prisma/seed.ts`。 然后粘贴以下模板代码

```ts
import { PrismaClient } from '@prisma/client'
// 初始化 Prisma Client
const prisma = new PrismaClient()

async function main() {
  //在此编写 Prisma Client 查询
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // 关闭 Prisma Client
    await prisma.$disconnect()
  })
```

为了能够让 nodejs 运行 typescript，我们需要安装`ts-node`

```bash
yarn add ts-node --dev
```

然后在 `tsconfig.json` 中指定输出格式为 `commonjs`

```json
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

接下来，我们在 `main` 函数中创建一个用户

```ts
async function main() {
  const user = await prisma.user.create({
    data: {
      name: '小马',
      avatar:
        'https://p3-passport.byteimg.com/img/user-avatar/585e1491713363bc8f67d06c485e8260~100x100.awebp',
    },
  })
  console.log(user)
}
```

在该函数中，涉及数据模型（`prisma.user`）、data(`name, avatar`) 参数等，我们都可以使用`control + 空格键`来体验 typescript 带来的智能提示。

执行命令

```bash
npx ts-node ./prisma/seed.ts
```

执行后，我们就可以在数据库中看到这条添加的数据。

![播种的用户数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ca1360f70fcb4be08f4a03468caccd28~tplv-k3u1fbpfcp-zoom-1.image)

视频数据我找了“译学馆”中的一个[API](https://api.yxgapp.com/courses/1087 '译学馆') 作为我的初始数据，修改 `main` 函数来填充视频数据。

```ts
import example from './example.json'

async function main() {
  const category = await prisma.category.create({
    data: {
      name: '数学',
    },
  })
  const chapters = example.data.outlines.reduce((res, item) => {
    item.lectures.forEach((lecture) => {
      res.push({
        title: lecture.title ?? lecture.en_title ?? '',
        cover: lecture.resource.cover_url,
        url: lecture.resource.content[0].url,
      })
    })

    return res
  }, [])

  console.log(chapters)

  await prisma.video.create({
    data: {
      title: example.data.title,
      pic: example.data.cover_url,
      desc: example.data.brief,
      categoryId: category.id,
      authorId: 1,
      chapter: {
        createMany: {
          data: chapters,
        },
      },
    },
  })
}
```

再次执行 `npx ts-node prisma/seed.ts`, 视频数据已经添加到了我们的数据库中。

![播种的视频数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6138ac7b77634e83a6cbc3f4e50ffdef~tplv-k3u1fbpfcp-zoom-1.image)

在 package.json 中添加 `prisma.seed` 字段

```diff-json
{
+  "prisma": {
+    "seed": "ts-node prisma/seed.ts"
+  },
   "devDependencies": {

   }
}
```

在开发中如再次修改数据表，执行 `prisma migrate dev` 的时候会自动执行 `seed`播种数据，关于播种数据详情请看 [prisma 文档](https://www.prisma.io/docs/guides/database/seed-database 'prisma 文档')

## Next.js 中实例化 PrismaClient

接下来我们需要在 Next.js 中调用 Prisma 查询语言，用于服务端获取数据。

新建一个 `lib/prisma.ts`

输入以下代码：

```ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}
export default prisma
```

上面代码是为了防止，在开发模式下， `PrismaClient` 耗尽数据链接数，将实例化的 `PrismaClient` 对象存到全局 `global` 中， 详情可以看官网[最佳实践](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices '最佳实践')。

PrismaClient 实例化完成，已经迫不及待要在首页渲染数据了， 先在首页打印下服务端获取的数据：

```tsx
import React from 'react'
import { GetServerSideProps } from 'next'
import prisma from '../lib/prisma'
import { makeSerializable } from '../lib/util'
import { Video, User } from '@prisma/client'

type Props = {
  data: (Video & {
    author: User
  })[]
}

export default function Page({ data }: Props) {
  console.log(data)
  return (
    <div className="mx-auto max-w-5xl px-3">
      <h1>首页</h1>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await prisma.video.findMany({
    include: { author: true },
  })

  return {
    props: { data: makeSerializable(data) },
  }
}
```

使用 prisma Schema 生成数据模型还有一个优势就是，减少写 typescript 接口的烦恼，凡是数据模型和增删查改相关的 `typescript interface` 都可以直接从 `@prisma/client`中直接引用；

Next.js 中，服务端渲染的数据在 `getServerSideProps` 函数中获取，如果直接将数据库中的数据查出传递给 `props`，会在控制台中看到如下错误:

![Next.js 渲染未序列化的数据报错](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e08bca9f78d481d9319795072a6014a~tplv-k3u1fbpfcp-zoom-1.image)

原因 Next.js 服务端获取的数据都是通过 JSON 的形式输出在 window 全局对象上的，而是 `createAt` 是 `Date` 类型，是一个 `Object`对象，所以无法被 JSON 序列化，因此我们需要让数据变得可序列化`makeSerializable`，代码如下：

```ts
export function makeSerializable<T extends any>(o: T): T {
  return JSON.parse(JSON.stringify(o))
}
```

序列化后的数据，便可以在控制台中打印，然后就可以使用 React 愉快地渲染数据了，我们使用 Tailwindcss 中的 Grid 布局，将页面分成 2 栏，最终效果如下：

![视频首页](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/501a8384679546e18247b714b928759a~tplv-k3u1fbpfcp-zoom-1.image)

## 详情页面实现

接着我们使用同样的逻辑，来实现下详情页面。新建一个`./pages/video/[id].tsx` 文件按首页的逻辑，我们写下了如下代码

```ts
export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await prisma.video.findUnique({
    include: {
      chapter: true,
      author: true,
    },
    where: {
      id: Number(context.params.id),
    },
  })

  return {
    props: {
      data: makeSerializable(data),
    },
  }
}
```

可以通过 `context.params.id`获取 url 上的 `videoId`，`findUnique`方法可以查询数据库中的唯一记录。此时访问 `http://localhost:3000/video/1`，我们便可以在控制台上打印出 data 参数。

![全部视频章节数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12d2db88086042ac92903a4918d836cf~tplv-k3u1fbpfcp-zoom-1.image)

由于章节数量太多，在一个页面中一次渲染 210 条数据是不合理的，比较好的办法是将“章节数据”通过接口来获取，实现滚动翻页。

### 翻页接口

新建一个 `./pages/api/chapter.ts` 文件，用于获取视频章节数据的接口，输入以下接口代码

```ts
import prisma from '@/lib/prisma'
import { makeSerializable } from '@/lib/util'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId, cursor } = req.query
  if (!videoId) {
    res.status(400).json({ message: 'videoId is required' })
  }

  const data = await prisma.chapter.findMany({
    cursor: cursor && {
      id: +cursor,
    },
    take: 11,
    where: {
      videoId: +videoId,
    },
  })
  res.status(200).json({
    data: makeSerializable(data.slice(0, 10)),
    nextCursor: data[10]?.id,
  })
}
```

上面代码中，我们使用`take` 和 `cursor`来实现翻页，默认查询 11 条数据，但只返回前 10 条数据，将最后一条数据作为下次查询的指针。

保存代码后，访问下接口地址 http://localhost:3000/api/chapter?videoId=1

![视频章节翻页接口](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb3bd6f0fc4d4bebbbcbd7d902ed221e~tplv-k3u1fbpfcp-zoom-1.image)

我们可以看到返回 10 条数据和下一个章节的指针，至此分页接口实现完成。

### 滚动翻页

详情页分类 2 个部分，视频基础信息是在服务端渲染，章节信息通过接口在客户端渲染，为了方便实现滚动翻页，我们安装一个包 [swr](SWR: https://swr.vercel.app/),全称是 stale-while-revalidate，也是 vercel 开源的一个数据流请求库。

```bash
yarn add  swr
```

修改 `./pages/video/[id].tsx` 中的代码为以下代码

```tsx
import React, { useRef, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { makeSerializable } from '@/lib/util'
import { Video, User, Chapter } from '@prisma/client'
import useSWRInfinite from 'swr/infinite'
import useOnScreen from '@/hooks/useOnScreen'

type Props = {
  video: Video & {
    author: User
  }
}

type Result = { data: Chapter[]; nextCursor: number }

const getKey = (pageIndex, previousPageData, videoId) => {
  // reached the end
  if (previousPageData && !previousPageData.data) return null

  // 首页，没有 `previousPageData`
  if (pageIndex === 0) return `/api/chapter?videoId=${videoId}`

  // 将游标添加到 API
  return `/api/chapter?cursor=${previousPageData.nextCursor}&videoId=${videoId}`
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Page({ video }: Props) {
  const ref: any = useRef<HTMLDivElement>()
  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref)

  const { data, error, size, setSize } = useSWRInfinite<Result>(
    (...args) => getKey(...args, video.id),
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  const hasNext = data && data[data.length - 1].nextCursor
  const isLoadingInitialData = !data && !error

  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')

  useEffect(() => {
    if (onScreen && hasNext) {
      setSize(size + 1)
    }
  }, [onScreen, hasNext])

  return (
    <div className="mx-auto max-w-5xl px-3 pb-5">
      <h1 className="my-4 text-center text-3xl">{video.title}</h1>
      <div className="text-center">
        <Image src={video.pic} width={320} height={180} alt={video.title} />
      </div>
      <div className="p-3">{video.desc}</div>
      <h2 className="my-2 text-xl">章节视频</h2>
      <div>
        <main className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-4">
          {data &&
            data.map((pageData, index) => {
              // `data` 是每个页面 API 响应的数组。
              return pageData.data.map((item) => (
                <div
                  className="flex flex-col justify-center p-2 ring-1 ring-gray-200"
                  key={item.id}
                >
                  <Link href={`/video/chapter/${item.id}`}>
                    <a className="mx-auto">
                      <Image
                        className="aspect-video"
                        src={item.cover}
                        width={160}
                        height={90}
                        alt={item.title}
                      />
                      <div className="mt-2 h-12 overflow-hidden text-ellipsis">{item.title}</div>
                    </a>
                  </Link>
                </div>
              ))
            })}
        </main>
        <div className="p-3 text-center" ref={ref}>
          {isLoadingMore ? 'Loading...' : hasNext ? '加载更多' : '没有数据了'}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const video = await prisma.video.findUnique({
    include: {
      author: true,
    },
    where: {
      id: Number(context.params.id),
    },
  })

  return {
    props: {
      video: makeSerializable(video),
    },
  }
}
```

该页面包含 2 部分内容，视频的基础信息是在服务端渲染的，视频的章节信息通过`useSWRInfinite`无限加载, 当底部“加更多数据”呈现在页面中的时候自动执行下一页，所以使用到一个 Hooks `useOnScreen` 用于监听 div 元素有没有在页面上显示。

```ts
import { useState, useEffect, MutableRefObject } from 'react'

export default function useOnScreen<T extends Element>(
  ref: MutableRefObject<T>,
  rootMargin: string = '0px'
): boolean {
  // 状态是否可见
  const [isIntersecting, setIntersecting] = useState<boolean>(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // observer 回调触发跟新状态
        setIntersecting(entry.isIntersecting)
      },
      {
        rootMargin,
      }
    )
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => {
      ref.current && observer.unobserve(ref.current)
    }
  }, [])
  return isIntersecting
}
```

IntersectionObserver API，可以自动"观察"元素是否可见，Chrome 51+ 已经支持。由于可见（visible）的本质是，目标元素与视口产生一个交叉区，所以这个 API 叫做"交叉观察器"。

最终实现效果如下

![视频章节页](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/453a02ef20cd45468698e2c0e4e719a9~tplv-k3u1fbpfcp-zoom-1.image)

最后视频详情页的代码与前面都差不多，这里就不过多赘述了，感兴趣的小伙伴可以直接看 [GitHub 仓库](https://github.com/maqi1520/next-prisma-video-app) 中的代码，我相信你已经学会了 prisma + Next.js 全栈开发的主要流程。

## 小结

本文通过实现一个视频网站为例，介绍了 prisma 这款 Node.js ORM 框架如何在 Next.js 中使用。

整体流程是：

1. 编写 prisma Schema 设计数据库；
2. 执行 prisma migrate 实现 Schema 到数据库的迁移；
3. 执行 prisma seed 填充数据库；
4. 在 Next.js 的 `getServerSideProps` 中调用 prisma 查询语言，实现服务端渲染；

prisma 对于 Next.js 来说，可谓是如虎添翼，有了它们，我们前端工程师轻松步入了全栈开发。你学会了吗？若对你有帮助，记得帮我点赞。

## 后续

当然我们的视频网站目前还知识一个雏形，用户是手动录入数据库的，还有登录和注册机制，接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

- 使用 next-auth 来实现 Next.js 应用的鉴权与认证
- 使用 React query 给 Next.js 应用全局状态管理
- 使用 i18next 实现 Next.js 应用国际化
- 使用 Playwright 进行 Next.js 应用的端到端测试
- 使用 Github actions 给 Next.js 应用创建 CI/CD
- 使用 Docker 部署 Next.js 应用
- 将 Next.js 应用部署到腾讯云 serverless

你对哪块内容比较感兴趣呢？欢迎在评论区留言，感谢您的阅读。
