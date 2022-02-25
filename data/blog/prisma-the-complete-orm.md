---
title: '【译】适用于Node.js和TypeScript的完整ORM —— Prisma'
date: '2021/6/1'
lastmod: '2021/6/1'
tags: [ORM]
draft: false
summary: 'Prisma是 Node.js 和 TypeScript 的下一代 ORM。经过两年多的开发，我们很高兴分享所有 Prisma 工具已准备好投入生产！'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1785d30401ab4d5ab6181bfae59ad848~tplv-k3u1fbpfcp-watermark.image',
  ]
authors: ['default']
layout: PostLayout
---

> 翻译自：[www.prisma.io/blog](https://www.prisma.io/blog/prisma-the-complete-orm-inw24qjeawmb)

[Prisma](https://www.prisma.io/)是 Node.js 和 TypeScript 的下一代 ORM。经过两年多的开发，我们很高兴分享所有 Prisma 工具已准备好投入生产！

## 一个对象关系映射的新范例

Prisma 是适用于 Node.js 和 TypeScript 的下一代[开源](https://www.github.com/prisma/prisma)ORM。它包含以下工具：

- [**Prisma Client**](https://www.prisma.io/client)——自动生成且类型安全的数据库客户端
- [**Prisma Migrate**](https://www.prisma.io/migrate)——声明式数据建模和可自定义的迁移
- [**Prisma Studio**](https://www.prisma.io/studio)——现代化的用户界面，可查看和编辑数据

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bec60eddc8db4d949f078967085e6800~tplv-k3u1fbpfcp-zoom-1.image)

这些工具可以在任何 Node.js 或 TypeScript 项目中一起或单独采用。Prisma 当前支持 PostgreSQL，MySQL，SQLite，SQL Server（预览版）。 MongoDB 的连接器正在开发中，请在[此处注册 Early Access 程序](https://www.notion.so/prismaio/Support-MongoDB-9f115ebf4a754069a7d7eaae94dc4651)。

### 数据库是很难的

使用数据库是应用程序开发中最具挑战性的领域之一。数据建模，模式迁移和编写数据库查询是应用程序开发人员每天处理的常见任务。

在 Prisma，我们发现 Node.js 生态系统虽然在构建数据库支持的应用程序中越来越流行，但并未为应用程序开发人员提供处理这些任务的现代工具。

> 应用程序开发人员应该关心数据，而不是 SQL

随着工具变得更加专业化，应用程序开发人员应该能够专注于为组织实现增值功能，而不必花费时间通过编写胶合代码来遍历应用程序的各个层。

### Prisma —— Node.js 和 TypeScript 的完整 ORM

尽管 Prisma 解决了与传统 ORM 相似的问题，但是其对这些问题的处理方式却根本不同。

**在 Prisma schema 中数据建模**

使用 Prisma 时，您可以在 Prisma 模式中定义数据模型。以下是 Prisma 模型的样例：

```js
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

schema 中的每一个 model 都映射到基础数据库中的表，并作为 Prisma Client 提供的生成的数据访问 API 的基础。Prisma 的[VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)提供语法高亮显示，自动补全，快速修复和许多其他功能，使数据建模具有神奇而令人愉悦的体验。

**使用 Prisma Migrate 进行数据库迁移**

Prisma Migrate 将 Prisma 模式转换为所需的 SQL，以创建和更改数据库中的表。可以通过[Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli)提供的 `prisma migration` 命令使用它。

PostgreSQL:

```sql
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER,

    PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

ALTER TABLE "Post" ADD FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

在基于 Prisma schema 自动生成 SQL 的同时，您可以轻松地根据自己的特定需求对其进行自定义。通过这种方法，Prisma Migrate 在生产率和控制力之间取得了很好的平衡。

**使用 Prisma Client 进行直观且类型安全的数据库访问**

与 Prisma Client 一起使用的主要好处是，它使开发人员可以在对象中进行思考，因此提供了一种熟悉且自然的方式来推理其数据。

Prisma Client 没有模型实例的概念。相反，它有助于制定始终返回纯 JavaScript 对象的数据库查询。多亏了生成的类型，可以为查询获得了自动补全功能。

另外，作为对 TypeScript 开发者的一种奖励。Prisma Client 查询的所有结果都是完全类型化的。事实上，Prisma 提供了任何 TypeScript ORM 中最强大的类型安全保证（你可以在[这里](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm#type-safety)阅读与 TypeORM 的类型安全比较）。

列表查询

```js
// Find all posts
const posts = await prisma.post.findMany()
```

关系查询

```js
// Find all posts and include their authors in the result
const postsWithAuthors = await prisma.post.findMany({
  include: { author: true },
})
```

嵌套插入数据

```js
// Create a new user with a new post
const userWithPosts: User = await prisma.user.create({
  data: {
    email: 'ada@prisma.io',
    name: 'Ada Lovelace',
    posts: {
      create: [{ title: 'Hello World' }],
    },
  },
})
```

过滤

```js
// Find all users with `@prisma` emails
const users = await prisma.user.findMany({
  where: {
    email: { contains: '@prisma' },
  },
})
```

```js
const postsByUser = await prisma.user.findUnique({ where: { email: 'ada@prisma.io' } }).posts()
```

分页

```js
const posts = await prisma.post.findMany({
  take: 5,
  cursor: { id: 2 },
})
```

**Prisma Studio 的现代管理界面**

Prisma 还为你的数据库提供了一个现代化的管理界面–想想看 phpMyAdmin，但在 2021 年。😉

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3203cae51d5c45b4912011ec8dba15e0~tplv-k3u1fbpfcp-zoom-1.image)

## Prisma 适合任何技术栈

Prisma 与你构建的应用程序无关，并将很好地补充你的技术栈，无论你喜欢的技术是什么。你可以在这里找到更多关于 Prisma 如何与你喜欢的框架或库一起工作的信息。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c81b8e152046483baf09630d25382404~tplv-k3u1fbpfcp-zoom-1.image)

如果你想使用这些技术或其他方法来探索 Prisma，你可以查看我们的即时运行[示例](https://github.com/prisma/prisma-examples/)

## 已经为关键型应用程序的投产做好准备

Prisma 在过去三年中发展了很多，我们非常高兴与开发人员社区分享结果。

### 从 GraphQL 到数据库

自从我们开始构建开发人员工具以来，作为一家公司，在过去的几年中，我们经历了许多主要的产品迭代和发展过程：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f04575e4b8b84eba811e555998410798~tplv-k3u1fbpfcp-zoom-1.image)

Prisma 是我们从成为 GraphQL 生态系统的早期创新者中学到的经验教训以及我们从小型创业公司到大型企业的各种规模的数据层获得的见解的结果。

自三年前首次发布以来，Prisma 已被成千上万的公司使用，Prisma 经过了实战测试，并准备用于关键任务应用程序。

### 我们关心开发人员

Prisma 是开放开发的。我们的产品和工程团队正在监控 GitHub 的问题，通常在问题打开后 24 小时内做出响应。

新版本每两周发布一次，包含新特性、bug 修复和大量改进。每次发布后，我们都会在 Youtube 上直播新功能，并从社区获得反馈。

我们还会尝试通过专门的社区支持团队，在开发人员提出关于 Prisma 的任何问题时，无论是在 Slack，GitHub 讨论区还是 Stackoverflow 上，都可以为他们提供帮助。

这是我们的社区数量：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/387e960e15ea4f51847d803573c7e5c9~tplv-k3u1fbpfcp-zoom-1.image)

### 公司在生产中使用 Prisma

我们很高兴看到 Prisma 如何帮助各种规模的公司提高生产力并更快地交付产品。

在我们的旅程中，阿迪达斯、HyreCar、Agora Systems、Labelbox 等公司为我们提供了关于如何发展产品的宝贵意见。我们有幸与一些最具创新性和独创性的技术领导者合作。

如果您想了解 Prisma 如何帮助这些公司提高生产力，请查看以下资源：

- Rapha

  - blog——[Prisma 如何帮助 Rapha 管理其移动应用程序数据](https://www.prisma.io/blog/helping-rapha-access-data-across-platforms-n3jfhtyu6rgn)
  - Talk——[Prisma 在 Rapha](https://www.youtube.com/watch?v=A617FvOZdFE&ab_channel=Prisma)

- iopool

  - blog——[iopool 如何使用 Prisma 在不到 6 个月的时间内重构其应用程序](https://www.prisma.io/blog/iopool-customer-success-story-uLsCWvaqzXoa)
  - Talk——[Prisma 在 ipool](https://www.youtube.com/watch?v=mWvroX_lkZI&ab_channel=Prisma)

### 从原型到开发再到生产

最好的开发者工具是那些不走寻常路的工具，并能轻松地适应项目的日益复杂化。这正是我们设计 Prisma 的方式。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecae6bb7bae04c5baef61439de7f3541~tplv-k3u1fbpfcp-zoom-1.image)

Prisma 有内置的工作流程，适用于开发生命周期的所有阶段，从原型设计到开发，到部署，到 CI/CD，到测试等等。

### 下一代 Web 框架基于 Prisma 构建

我们特别感到谦虚，许多框架和库作者选择 Prisma 作为其工具的默认 ORM。以下是一些使用 Prisma 的高级框架的选择：

- [RedwoodJS](https://redwoodjs.com/)——基于 React 和 GraphQL 的全栈框架
- [Blitz](https://blitzjs.com/)——基于 Next.js 的全栈框架
- [KeystoneJS](https://next.keystonejs.com/)——无头 CMS
- [Wasp](https://wasp-lang.dev/)——用于基于 React 开发全栈 Web 应用程序的 DSL
- [Amplication](http://amplication.com/)——用于基于 React 和 NestJS 构建全栈应用程序的工具集

## 开源及其他

我们是一家由 VC 资助的公司，其团队热衷于改善应用程序开发人员的生活。当我们通过构建开源工具开始我们的旅程时，我们对 Prisma 的长期愿景远比构建“仅” ORM 更大。

在我们最近的企业活动和 Prisma 聚会中，我们开始分享这一愿景，我们称之为**应用程序数据平台**。

> Prisma 的愿景是使 Facebook、Twitter 和 Airbnb 等公司使用的定制数据访问层民主化，并使其适用于所有规模的开发团队和组织。

这个想法主要是受到 Facebook、Twitter 和 Airbnb 等公司的启发，这些公司在其数据库和其他数据源的基础上建立了定制的数据访问层，使应用程序开发人员更容易以安全和高效的方式访问他们需要的数据。

Prisma 的目标是使这种自定义数据访问层的思想民主化，并使其可用于任何规模的开发团队和组织。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c9164c3b6534c6ca79ed17b9b1774c0~tplv-k3u1fbpfcp-zoom-1.image)
