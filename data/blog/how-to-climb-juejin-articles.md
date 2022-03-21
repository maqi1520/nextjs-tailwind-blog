---
title: '如何盘点出掘金的年度高赞文章？'
date: '2022/1/1'
lastmod: '2022/3/21'
tags: [Node.js, 掘金社区, 前端]
draft: false
summary: '我的新年 Flag ，就是掘金等级到达 V4，而对于绝大多数读者来说，新年 Flag 中是否有“学习”这一项呢，对于我来说，我也是，于是就有萌生一个想法，我想统计出掘金的年度高赞文章。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f819a7d88075406c819cd5b3e22c59d2~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

各位掘友，新年好，今天是 2022 年的第一天，掘金的人气作者投票活动如火如荼，榜单已经落幕，当然跟我半毛钱关系都没有，我的新年 Flag ，就是掘金等级到达 V4，而对于绝大多数读者来说，新年 Flag 中是否有“学习”这一项呢，对于我来说，我也是，于是就有萌生一个想法，我想统计出掘金的年度高赞文章。

1. 是可以收藏这些高赞文章，然后慢慢学习；
2. 是想通过这些文章学习下，哪些文章是适合读者的，这些文章的优点在哪？我们该如何写文章？

## 统计年度活跃作者

![掘金年度活跃作者](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f0a032f321d4735ba50731031f00954~tplv-k3u1fbpfcp-watermark.image?)

正好我们可以通过“年底投票页面”统计出今年活跃的作者，这个页面是滚动翻页，通过 `has_more` 来判断是否有下一页，那么我们就可以通过 nodejs 获取到所有作者的 ID。

```js
const axios = require('axios')
const _ = require('lodash')
const fs = require('fs')

const url = 'https://api.juejin.cn/list_api/v1/annual/list'

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  cookies: 'xxx',
}

let userId = []

const fetchUserId = (cursor = 0) => {
  console.log('请求第' + cursor + '页')
  axios
    .post(
      url,
      { annual_id: '2021', list_type: 0, cursor: cursor + '', keyword: '' },
      {
        headers,
      }
    )
    .then((res) => {
      const data = res.data
      userId = userId.concat(_.map(data.data, 'user_id'))
      if (data.has_more && userId.length < 1000) {
        fetchUserId(cursor + 10)
      } else {
        fs.writeFileSync('./0-1000.json', JSON.stringify(userId))
      }
    })
}
fetchUserId()
```

`cookies` 可以在浏览器中复制，这样就可以统计排名前 1000 的作者，
分次统计是为了防止掘金后台接口限制。通过 3 次运行，结果统计出这次报名的有 2035 名作者进行报名，当然这个数据不一定准确，接下来我们可以根据所有的用户 ID 获取每位作者的文章了。

## 获取每位作者的文章列表

我们可以根据投票详情页获取每位作者的文章列表。这里不得不吐槽下掘金的这个接口，前端只展示 3 篇文章，后端却给了全部数据。。。 😅

![年度作者文章页面](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2cb9186241d84fc38e973ef8b74f9a0a~tplv-k3u1fbpfcp-watermark.image?)

一起来看下每条数据详情：

![年度作者接口返回](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/426290879eac4a11a6586ce31744d6b6~tplv-k3u1fbpfcp-watermark.image?)

这里的文章默认是根据热度排列的，但是我们不知道是根据点赞排列，还是收藏排列的，我们不清楚。

还好，我们可以根据读者页面获取每位掘金作者的文章，如下图：

![掘金个人主页接口返回](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d1daac0dacd84147a3f32f97c1bdac0a~tplv-k3u1fbpfcp-watermark.image?)

再次吐槽下，user_info 数据重复了 N 次，
这里的接口有点赞数，评论数和收藏数。（弱弱问 `digg_count` 是什么意思？哪个单词的前缀？）

![掘金文章接口返回详情](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ff3c595ae5d4aafba69f5410c6323eb~tplv-k3u1fbpfcp-watermark.image?)

## 建表统计

接下来我们要统计数据了，这么大的数据量，我们不可能用 json 存储，我这边选用了 psql，
ORM 选用了 [prisma](https://pris.ly/d/prisma-schema)，不了解的同学可以看我之前的翻译文章[《适用于 Node.js 和 TypeScript 的完整 ORM —— Prisma》](https://juejin.cn/post/6968713479339376654)

**建立 schema**

```js
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Article {
  article_id    String           @id
  title         String
  brief_content String
  content       String?
  cover_image   String
  user_id       String
  ctime         String
  digg_count    Int
  view_count    Int
  comment_count Int
  collect_count Int
  author_id     String
  author        Author           @relation(fields: [author_id], references: [id])
  category_id   String
  category      Category         @relation(fields: [category_id], references: [id])
  tags          TagsOnArticles[]
}

model Author {
  id           String    @id
  name         String
  avatar_large String
  articles     Article[]
}

model Category {
  id       String    @id
  name     String
  articles Article[]
}

model Tag {
  id       String           @id
  name     String
  articles TagsOnArticles[]
}

model TagsOnArticles {
  article    Article @relation(fields: [article_id], references: [article_id])
  article_id String
  tag        Tag     @relation(fields: [tag_id], references: [id])
  tag_id     String

  @@id([article_id, tag_id])
}
```

**表关系**

- 文章跟用户 —— 多对一
- 文章跟跟分类 —— 多对一
- 文章跟标签 —— 多对多

**获取用户的文章列表代码**

```js
/**
 * 获取用户的文章列表
 * @param userId
 * @returns
 */

const fetchList = async (userId: string) => {
  console.log('开始采集' + userId)
  return new Promise((reslove) => {
    setTimeout(async () => {
      await axios
        .post(
          'https://api.juejin.cn/content_api/v1/article/query_list?aid=2608&uuid=6899676175061648910',
          {
            user_id: userId,
            sort_type: 1,
            cursor: '0',
          },
          { headers }
        )
        .then((res: any) => {
          const data = res.data.data
          if (data && data.length) {
            // 插入数据库
            insert(data)
              .catch((e) => {
                console.error(e)
                process.exit(1)
              })
              .finally(() => {
                reslove('')
              })
          } else {
            reslove('')
          }
        })
    }, 2000)
  })
}
```

为了防止提交过于频繁，我这边设置 2 秒延迟。

**插入数据库代码**

```js
/**
 * 插入数据库
 * @param data
 */
async function insert(data: any) {
  for (const item of data) {
    const article_info = _.pick(item.article_info, [
      'article_id',
      'title',
      'brief_content',
      'cover_image',
      'user_id',
      'ctime',
      'digg_count',
      'view_count',
      'comment_count',
      'collect_count',
    ])

    const author_user_info = await prisma.author.findUnique({
      where: {
        id: item.author_user_info.user_id,
      },
    })
    if (!author_user_info) {
      await prisma.author.create({
        data: {
          id: item.author_user_info.user_id,
          name: item.author_user_info.user_name,
          avatar_large: item.author_user_info.avatar_large,
        },
      })
    }

    const category = await prisma.category.findUnique({
      where: {
        id: item.category.category_id,
      },
    })

    if (!category) {
      await prisma.category.create({
        data: {
          id: item.category.category_id,
          name: item.category.category_name,
        },
      })
    }
    const article = await prisma.article.findUnique({
      where: {
        article_id: article_info.article_id,
      },
    })
    const creates_tags = _.map(item.tags, (tag: any) => {
      return {
        tag: {
          connectOrCreate: {
            create: {
              id: tag.tag_id,
              name: tag.tag_name,
            },
            where: {
              id: tag.tag_id,
            },
          },
        },
      }
    })
    if (!article) {
      console.log('create---' + article_info.title)

      await prisma.article.create({
        data: {
          ...article_info,
          author_id: item.article_info.user_id,
          category_id: item.category.category_id,
          tags: {
            create: creates_tags,
          },
        },
      })
    }
  }
}
```

执行 `fetchList` 就可以获取单个用户的文章了，接下来就是遍历所有 userId， 将所有文章列表保存到数据库中。

这里我们不能通过 `Promise.all`去执行，因为 `Promise.all`会将所有的 `Promise` 同步执行，这样后端为了防止过载，就会直接拒绝你的请求。我们需要将每个请求，每隔 2s 依次请求，然后保存到数据库，该使用什么方法呢？（这个一道常规面试题，如何让多个 `Promise` 依次执行？）看到这里的小伙伴，不妨在评论区留言。

## 效果

等待全部运行完成，我们就将年度作者的全部文章保存到数据库了。
运行下面命令，通过 prisma studio 查看数据

```bash
npx prisma studio
```

查询创建时间大于 2021-01-01

```js
new Date('2021/01/01').getTime() //1609430400000
```

![统计结果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7886a0d8f76d46eaaeed0c1195443d47~tplv-k3u1fbpfcp-watermark.image?)

根据点赞数降序排列，就得到我们的高赞文章列表了。

## 小结

根据这些结果我也总结出了几点，也就是如何写出高赞的文章？

1. 读者群体要广

   写 ES6 > Vue > React， 就像我之前写的文章[《如何测试 React 异步组件？》](https://juejin.cn/post/7046686808377131039)，阅读量也就可想而知了，会的肯定不需要看你的文章，不会的也没这个需求。

2. 文章一定要容易理解，一定要让读者理解知识点。

   就像作者 **林三心** 说的

   > 用最通俗的话讲最难的知识点是我的座右铭。

## 最后

小伙伴们，你们是否看懂了我的这篇文章了呢，请给我一个小赞，你的赞是对我最大的支持。

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/how-to-climb-juejin-articles)
