---
title: 大家都在嘲笑 Next.js 14
date: 2023/11/3 19:56:06
lastmod: 2024/5/19 21:24:07
tags: [React.js]
draft: false
summary: 上周 Next.js 14 发布了，该版本相较于 13，没有任何 API 变更，主要更新点是 Turbopack 带来了大幅的性能提升以及 Server Actions 功能进入稳定版本。
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9eba2a4e4476450ab4250d338b53b535~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1197\&h=1596\&s=113433\&e=jpg\&b=02163e',
  ]
authors: ['default']
layout: PostLayout
---

上周 Next.js 14 发布了，该版本相较于 13，没有任何 API 变更，主要更新点是 Turbopack 带来了大幅的性能提升以及 Server Actions 功能进入稳定版本。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24c765b1b20a4c9d90e6e026d535f161~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1540&h=752&s=341590&e=png&b=000000)

Next.js 14 带来了三个主要新功能

- Turbopack：在 app router 和 page router 中通过了 5,000 个测试

  - 本地启动服务器时间快了约 50%
  - 热模块替换速度快了约 94%

然而并不是所有的测试都通过了，当前只通过了 90% 的测试，所以 Turbopack 还不稳定。

- 第二点 Server Actions 被标记为稳定。
  - 集成了缓存和重新验证
  - 简单的函数调用，与表单原生配合使用
- 第三点 **部分预渲染（预览）**：快速的初始静态响应 + 流式动态内容

其中第二点在 Twitter 中引起了巨大讨论，也就是下面这张图，

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59a2b92e3bab4aeb95e1b7e6ff58af4a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=972&h=569&s=173045&e=png&b=080608)

大家都在拿这张图开玩笑，甚至出现了 "use electronics"。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a67e433b27947b2b8e764d1a72350e7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=559&h=564&s=177245&e=png&b=0c0c0c)

这种写法好像仿佛回到了 PHP 时代，前端后代码写在一个文件里，它非常容易理解，但是很多人在质疑代码的安全问题，Sql 没有使用占位符，它是否会受到**SQL 注入攻击**。

那么我们来分析下，上面幻灯片中的代码是否存在安全问题，
最主要是下面这句。

```js
await sql`INSERT INTO Bookmarks (slug) VALUES (${slug})`
```

## SQL 注入攻击

首先来看下 Sql 是如何注入攻击的。

比如，我们需要通过 Url 获得当前用户的 id，查询该用户的信息，使用以下代码来实现。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63dc1898734845cbaa52ac6eb9c192e9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1436&h=490&s=318737&e=png&b=201f1f)

一旦用户知道了程序的漏洞，使用以下 url 来访问，那么我们的程序将瞬间被摧毁。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3206433053534e5397bf791a523813a7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1624&h=382&s=665545&e=png&b=212020)

这是一个有效的 SQL 命令，查询的同时将删除所有用户。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66ee78097fe3466d98e0c4cb95bc13e9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1740&h=288&s=356333&e=png&b=212020)

数据库在这种情况下执行，它会变成两个 sql 查询：

第一个 sql select 语句，它实际上不做任何事情；

第二个 sql 会删除你的整个 Users 数据库；

这就是 sql 注入，因此，直接拼接的 sql，不经过处理，是不安全的。

安全的查询方法是需要使用参数化查询, 如下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f98e2d80c1ee4cd6bca090c1b0b9c756~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1542&h=420&s=247601&e=png&b=201f1f)

`userId` 会替换 sql 中的`$1`，这样 sql 执行就安全了。

## 标签模板

我们再看上面幻灯片中的 sql 语句，与上面两种操作数据不同的是他使用的是 ES6 中的 **标签模板**

```js
await sql`INSERT INTO Bookmarks (slug) VALUES (${slug})`
```

标签模板其实不是模板字符串，而是函数调用的一种特殊形式。“标签”指的就是函数，紧跟在后面的模板字符串就是它的参数。

```js
tag`hello`
// 等同于
tag(['hello'])
```

因此在标签模版之前需要先定义函数

```js
function tag(stringArr, ...values) {
  // ...
}
```

tag 函数的第一个参数是模版字符串，它是一个数组，后面的参数为模版中传入的值，也就是上面的`sql` 是一个函数，执行代码等同于

```js
await sql(['INSERT INTO Bookmarks (slug) VALUES (', ')'], slug)
```

因此幻灯片中的查询语句并不会直接在数据库上执行，而是经过了 sql 这个函数的封装，调用数据库的查询语言都在 sql 内部实现，它没有 sql 注入的风险。

## 小结

Next.js 14.0 加快了启动服务器时间和模块热替换，分别提速 50%和 94%，引入了部分预渲染，允许定义一个静态 HTML 壳，然后可以用`<Suspense />`流式传输动态内容； Server Actions 虽然引起了争议，那也只是大家工作之余的调侃，相比原先必须先写一个接口，再调接口，但对开发者来说是极大地简化了开发成本，可以直接请求数据库拿数据，对前端来说，真的太方便了。

那么，你认为呢？
以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

## 参考

- https://nextjs.org/blog/next-14

- https://youtu.be/2Ggf45daK7k?si=ZxrjR5o2PIMOpM7W
