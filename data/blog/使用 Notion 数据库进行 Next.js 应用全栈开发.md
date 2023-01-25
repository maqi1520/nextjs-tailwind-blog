---
title: 使用 Notion 数据库进行 Next.js 应用全栈开发
date: 2022/9/27 23:49:28
lastmod: 2023/1/25 11:42:59
tags: [React.js, 数据库]
draft: false
summary: 今天我就得带大家来白嫖一下 Notion 数据库，让我们的个人应用轻松上线，本文记录了利用 Next.js 和 Notion API 编写了一个前端刷题网站的全过程。
images: https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e025d77556e4073989114847ff39959~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

在上一篇中，我们使用了 strapi 和 Next.js 开发了一个简易微博，但是我没有部署上线，因为我知道这个小应用只能个人体验，若是我们的个人项目想要部署上线，难道还得花钱买服务器吗，“任何不能令人满意的东西，不值得我们屈尊“，今天我就得带大家来白嫖一下 Notion 数据库，让我们的个人应用轻松上线。

> 本文涉及代码都在[ Github 仓库](https://github.com/maqi1520/notion-fe-app)中

## Notion 是什么?

Notion 是一款极其出色的个人笔记软件，它将“万物皆对象”的思维运用到笔记中，让使用者可以天马行空地去创造、拖拽、链接。Notion 适合各种场景，无论是生活、工作还是学习，各种东西都可以在这里记录；它可以帮助用户记录日程表、每日计划、待办事项、日记等，到了时间系统会自动进行提醒。

但对我们程序员来说，Notion 除了是笔记软件，还可以是数据库。

> 在开始之前，我强烈建议不要在生产环境中使用 Notion 数据库。

## 需求分析

我先来介绍一下我的需求，之前写过一篇[《【实战】Next.js + 云函数开发一个面试刷题网站》](https://juejin.cn/post/7127513487546253348)，采用了"腾讯云云开发"中的云数据库和 Vercel 部署了一个面试刷题网站，但现在"腾讯云云开发"目前收费了，价格是 19.9 元/月，所以我打算将数据库从腾讯云迁移到 Notion，并且使用 Next.js 服务端渲染，最后部署同样使用 Vercel。这样做的优点是：

- 整个上线网站我都不用花钱
- SSR 渲染，搜索引擎可以收录网站中更多的页面。

## 创建 Notion 数据库

如果没有账户的同学，请大家自行注册前往 https://www.notion.so/ 注册账号，Notion 目前没有中文版本，大家可以装这个[油猴插件](https://greasyfork.org/zh-CN/scripts/430116-notion-zh-cn-notion%E7%9A%84%E6%B1%89%E5%8C%96%E8%84%9A%E6%9C%AC 'notion的汉化脚本')，汉化一下。

首先我们在 Notion 中，创建一个 `full page table` 页面，来作为我们的数据库保存数据。

1. 打开 Notion，添加一个 page，输入名称，并在模板中选择 DATABASE 下的 Table。

![新建页面创建 DATABASE](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/862d4219aad14f1099b4c7315193de53~tplv-k3u1fbpfcp-zoom-1.image)

2. 点击 `properties`，添加我们题目表所需要的一些数据项：

![Notion 添加 properties 字段](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e081d1eba7347a09d9aa95113f2d50c~tplv-k3u1fbpfcp-zoom-1.image)

### 题目表

根据之前的数据结构，添加字段，这是题目表的数据 ts 类型接口

```ts
export interface Question {
  _id: string
  category: string // 分类
  title: string // 标题
  desc: string // 简介
  options: string // 选项，JSON转成字符串
  explanation: string //  解析
  level: number //  难度
  tagId: number //  标签
}
```

![Notion properties 字段类型](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d906db332d14128971578dbf4e308a3~tplv-k3u1fbpfcp-zoom-1.image)

可以看到 Notion 数据字段也分为`文本`、`数字`、`下拉`、`多选`、`文件`等等，我们在右侧选择字段类型，所有添加完成后，我们再手动录入一条数据，以便于后续测试数据。

### 标签表

```ts
export interface Tag {
  id: number
  tagName: string
  image: string
}
```

![Notion 创建标签表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8e8ecb50752414797b2ed6dbd4eef6b~tplv-k3u1fbpfcp-zoom-1.image)

我们使用相同步骤，建立标签表，并且添加数据到表中。

### 建立表关联

题目表和标签表是多对一的关系，一个标签下有多道题目，一个题目只有一个标签

![Notion 建立表关联](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0d2a30765bf4de5af3c432497aea8d8~tplv-k3u1fbpfcp-zoom-1.image)

在题目表添加属性`tag`，选择 `Relation`，让后选择“标签”表

![Notion 建立表关联](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f84533c69ca248448dd6ea11a0e3f502~tplv-k3u1fbpfcp-zoom-1.image)

这样题目表和标签表就建立了关系

## 创建 Notion 集成

在使用 Notion API 之前，我们需要创建一个 Notion 的应用集成，获取 API Key。 打开 https://www.notion.so/my-integrations，打开 Notion 集成页面，登录自己的账号，点击 New integration 创建一个新的应用：

![创建 Notion 集成](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d8e733e652614f27b5f0d19bb0dd0b8d~tplv-k3u1fbpfcp-zoom-1.image)

名称可以自己起，上传一个 LOGO，然后关联一个 Notion 的工作空间：

![创建 Notion 集成，填写信息](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed8e8abde26849d68b4122a6c7525d3e~tplv-k3u1fbpfcp-zoom-1.image)

点击提交，这个应用就创建好了，在跳转的新页面里，把`Internal Integration Token`复制下来，不要泄露，否则拿到这个 key 的人都能操作你的笔记啦。

![复制 Notion Token](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd8d50adcc754b04a7d65fe4c950e32b~tplv-k3u1fbpfcp-zoom-1.image)

接下来在 Notion Page 页面，点击更多，创建 Connections，连接到我们刚才创建的应用

![Notion 页面关联集成应用](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bfec8debc08477aa2a1434bfbba084b~tplv-k3u1fbpfcp-zoom-1.image)

这样就可以使用 API 来操作笔记啦。

## 初始化项目

1. 创建一个 next 项目

```bash
npx create-next-app fe-app --typescript
cd fe-app
```

2. 安装 TailwindCSS

```bash
yarn add -D tailwindcss postcss autoprefixer @tailwindcss/typography
npx tailwindcss init -p
```

3. 编辑 `tailwind.config.js` 配置文件

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
```

4. 修改 `styles/global.css` 为 tailwindcss 的初始化指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. 设置 Node 环境变量，新建一个 `.env.local` 文件

```bash
NOTION_ACCESS_TOKEN=
NOTION_DATABASE_QUESTION_ID=
NOTION_DATABASE_TAG_ID=
```

TOKEN 为刚才复制的 TOKEN，数据库 ID 为 NOTION 页面 URL 上的 ID

![复制 Notion 数据库ID](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a06222fc4c041cca523cf31f2463493~tplv-k3u1fbpfcp-zoom-1.image)

## 链接数据库

我们需要安装 Notion Javascript 客户端，来获取表数据信息。

```bash
yarn add @notionhq/client
```

## 查询列表

新建一个 `lib/NotionServer.ts`, 将数据库请求的方法封装在这个 class 中

```ts
import { Client } from '@notionhq/client'

const auth = process.env.NOTION_ACCESS_TOKEN

const database = process.env.NOTION_DATABASE_QUESTION_ID ?? ''

type Question = any

export default class NotionService {
  client: Client

  constructor() {
    this.client = new Client({ auth })
  }

  async query(): Promise<Question[]> {
    const response = await this.client.databases.query({
      database_id: database,
    })

    return response.results
  }
}
```

新建`pages/api/question.ts`， 与约定式路由一样，任何在`pages/api` 目录下的文件都可以作为`/api/*`接口访问，以下代码就直接调用了刚才创建的 NotionServer：

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import NotionServer from '../../lib/NotionServer'

type Data = any

const notionServer = new NotionServer()

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const data = await notionServer.query()
  res.status(200).json(data)
}
```

此时我们访问 http://localhost:3000/api/question ，会看到如下数据

![Notion api 返回数据结构](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee9708f074a044709ed622314a1572af~tplv-k3u1fbpfcp-zoom-1.image)

这显然不是我们想要的数据，在 Notion 中，表中的每一个单元格数据，都有类型和针对这个类型的描述字段。
我们想要的格式是这样的，比如：

```json
{
  "title":"输出什么？"
  "desc":"题目描述"
}
```

title 字段叫标题，而且肯定是单行文本类型，是明确的，所以我们需要简化一下字段，在 `NotionServer.ts` 中加入一个`transformer` 方法，用于数据转换:

```ts
class NotionService {
  ...

  async query(): Promise<Question[]> {
    const response = await this.client.databases.query({
      database_id: database,
    });

    return response.results.map((item) => NotionService.transformer(item));
  }

  private static transformer(page: any): Question {
    let data: any = {};

    for (const key in page.properties) {
      switch (page.properties[key].type) {
        case "relation":
          data[key] = page.properties[key].relation[0].id;
          break;

        case "title":
        case "rich_text":
          data[key] =
            page.properties[key][page.properties[key].type][0].text.content;
          break;

        default:
          data[key] = page.properties[key];
          break;
      }
    }

    return data;
  }
}
```

转换后，刷新页面，便得到了我们想要的数据。

![转换后的 json 数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb10395e6f0f4379aa20372cd8c5ebcb~tplv-k3u1fbpfcp-zoom-1.image)

## 查询详情

根据 `page_id` 查询数据详情可以使用如下代码

```ts
async detail(id: string): Promise<Question> {
  const response = await this.client.pages.retrieve({
    page_id: id,
  });

  return NotionService.transformer(response);
}
```

同样查询结果需要转换一下，将 Notion 复杂结果转换为我们需要的简单数据结构。

## 添加/修改数据

添加和修改数据，我们可以使用下面这个 2 个方法

```ts
this.client.pages.create(paramters)
this.client.pages.update(paramters)
```

其中 paramters 的值，我们可以通过 ts 类型看，其实跟查询返回的数据一致，我只需要拷贝查询结果的其中一条数据，删除掉字段中的 id，替换掉里面的内容为真实数据即可。

![notionhq/client TS 类型提示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e3517c7ef6dd42cdab2bb8c445e0b687~tplv-k3u1fbpfcp-zoom-1.image)

下面是添加题目函数的代码：

```ts
async create(question: Question): Promise<any> {
  const response = await this.client.pages.create({
    parent: {
      database_id: database,
    },
    properties: {
      desc: {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: question.desc,
            },
          },
        ],
      },
      options: {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: question.options,
            },
          },
        ],
      },
      explanation: {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: question.explanation,
            },
          },
        ],
      },
      tag: {
        type: "relation",
        relation: [
          {
            id: question.tag,
          },
        ],
      },
      title: {
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: question.title,
            },
          },
        ],
      },
    },
  });
  return response;
}
```

编辑数据与添加数据方法相似，只需要拷贝查询结果的数据，将需要修改的部分修改掉即可，使用 Notion 作为数据库的还有一个好处，就是可以将 Notion 作为 CMS 系统来用，有时添加和修改不是必须的功能，我们可以直接在 Notion 后台进行数据管理。

## 数据库迁移

因此我们可以从云开发数据库中将数据导出，通过 api 导入到 Notion 数据库中。

首先在新建一个 `pages/api/create.ts` 用于创建题目的接口。

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import NotionServer from '../../lib/NotionServer'

type Data = any

const notionServer = new NotionServer()

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const data = await notionServer.create(req.body)

  res.status(200).json(data)
}
```

接下来就可以将导出的 json，通过执行本地 node fetch 的方式将数据全部导入到 Notion 中

```ts
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

(async () => {
  const content = fs.readFileSync(
    path.resolve(__dirname, "./fe.json"),
    "utf8"
  );

  const tags = [
    {
      _id: "6b428f57-0831-4280-ac1c-8d016c8d038b",
      id: 17,
      image: "/static/logo/fun.svg",
      tagName: "趣味题",
    },
    ...
  ];

  const data = content.split("\n");

  for (let index = 0; index < data.length; index++) {
    if (data[index].trim() === "") continue;
    let item = JSON.parse(data[index]);
    item.tag = tags.find((tag) => tag.id === item.tagId)?._id;

    const res = await fetch("http://localhost:3000/api/create", {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(item),
    }).then((res) => res.json());

    console.log("第" + index + "题" + item.title + res.id);
  }
  console.log("end");
})();
```

上面代码中 tags 我是选创建了一个 tag 查询接口，因为 tags 数据不多，所以我直接将数据复制了下来，用 nodejs 执行一下以上代码，我们便可以在控制台中看到数据导入的进度。

![数据迁移到 Notion 完成](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2db3d907d8244ca9aad789f7726050b5~tplv-k3u1fbpfcp-zoom-1.image)

执行完成，总共 968 题， 我们来 Notion 中看看导入的效果。

![Notion 查看数据表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/977c51ccbe4c45109228495e3775a6e8~tplv-k3u1fbpfcp-zoom-1.image)

当然我也将全部题目公开在 Notion 上面了，大家可以通过[这个链接](https://fixed-temper-f5d.notion.site/da90b4d7537745a4a88b03369017e07a?v=3e765e0593374163a035759fe46fba49)查看。

## 删除数据

在 Notion 中，不能使用 api 的方式删除数据，所以我们需要换一种思维来解决，在表中创建一个字段`In stock` 来标识，用于假删除数据，也就是将“删除数据逻辑”修改为“修改数据逻辑”，将这条数据修改为归档类型，所以之前查询列表接口需要加上 `In stock` 值为 `false`，查询未归档的数据。

下面是假删除数据的代码：

```ts
async remove(pageId: string) {
    const response = await this.client.pages.update({
      page_id: pageId,
      properties: {
        "In stock": {
          checkbox: true,
        },
      },
    });
    return response;
  }
```

## Next.js SSR

到此，我们完成了数据表的建设，以及数据库的迁移。完成了对 `NotionService` 的封装，有了 NotionService ，我们不但可以完成接口，而且还可以在 Next.js 中直接获取数据，用于服务端渲染。

以下是首页中服务端获取数据的部分实现代码

```ts
import React from "react";
import { GetServerSidePropsContext,InferGetServerSidePropsType } from "next";
import NotionServer from "@/lib/NotionServer";

export default function Interview({
  data,
  tags,
  q,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // 使用 props 数据，之间进行 render
  return (...)
}
// 在Nodejs 环境中执行
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { q = "", tagid, cursor } = context.query;
  const notionServer = new NotionServer();

  const tags = await notionServer.queryTags();

  const { data, has_more } = await notionServer.query({
    title: q as string,
    tagid: tagid as string,
  });
  // 获取到的数据，传递给组件props
  return {
    props: {
      data,
      tags,
      has_more,
      q,
    },
  };
}
```

这部分主要跟之前文章中的内容大致相同，所以我就不过多介绍了，我们直接来看下效果。

![Notion 和 Next.js 开发现效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31e4c176557449aa9a332212d8609f16~tplv-k3u1fbpfcp-zoom-1.image)

大家可以使用 https://notion.runjs.cool/ 访问体验，也可以与之前的腾讯云开发做对比 https://runjs.cool/

![Notion 和腾讯云接口对比](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a297549d08dd4d2293f5ccd003aabd92~tplv-k3u1fbpfcp-zoom-1.image)

Notion 小数据量接口平均 800ms，列表接口包含了答案详情，所以在 1s 以上，腾讯云每个接口都在 300ms 以下。

## 踩坑

虽然全文下来，大致上没什么难度，但是我在实践过程中也遇到了一些坑。

1. Notion 中，文本字段是一个数组，上面`transformer`代码中我们取值都是取了`[0].text.content`，但 `content` 的长度限制是 `2000`，所以我们之前的一些 Text 字段，超过 `2000` 需要拆分成数组存储，读取的时候再将数组拼接成一个字符串。

至于如何拆分，大家可以思考下，也直接看我的[代码仓库](https://github.com/maqi1520/notion-fe-app 'Github 地址')

2. 传统数据分页传 `page` 和 `page_size` 2 个字段，但在 Notion 中采用了 `start_cursor` 指针的方式，前端需要使用滚动翻页的方式。

## 小结

本文我们利用 Next.js 和 Notion API 编写了一个前端刷题网站，整个流程是：

- 创建数据库页面、配置属性、获取数据库 id。
- 从 Notion 官网创建应用，获取 API KEY。
- 使用 @notionhq/client 对 Notion 数据进行操作，编写接口
- 在 Page 中，使用 getServerSideProps 进行数据获取，让后使用 react 进行渲染页面。

使用 Notion 作为数据库有利有弊

最大的优点： 免费，打通 Notion，让笔记和网站得以同步；

缺点：Notion API 的结构比较复杂，接口固定，不能实现定义的功能，所以这里适合做一些尝试性的项目。

**思考：若是我们的网站也需要实现 CMS 自定义设计表单的功能，我相信 Notion 的数据结构值得我们参考。**

好了，以上就是利用 Notion API 和 Next.js 进行应用全栈开发的过程，你学会了吗？若对你有帮助，记得帮我点赞。

## 后续

接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

- 使用 Prisma 和 PostgreSQL 进行 Next.js 应用全栈开发
- 使用 NextAuth 实现 Next.js 应用的鉴权与认证
- 使用 React query 给 Next.js 应用全局状态管理
- 使用 i18next 实现 Next.js 应用国际化
- 使用 Playwright 进行 Next.js 应用的端到端测试
- 使用 Github actions 给 Next.js 应用创建 CI/CD
- 使用 Docker 部署 Next.js 应用
- 将 Next.js 应用部署到腾讯云 serverless

你对哪块内容比较感兴趣呢？欢迎在评论区留言，感谢您的阅读。
