# Next.js + Tailwind CSS Blog

我的个人博客第三版

使用技术栈：

- [Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs). - CSS 原子类框架

- [nextjs](https://nextjs.org/) - react 的服务端渲染框架

- [prisma](https://www.prisma.io/) - NodeJS ORM 框架

## 预览

https://nextjs-tailwind-blog.vercel.app/

## 部署

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/maqi1520/nextjs-tailwind-blog&project-name=blog&repository-name=blog)

### 其他云服务器

更新网站配置 `./src/config/index.ts`

- 修改数据库

`./prisma/schema.prisma`

```js
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

新建`.env` 文件

```js
DATABASE_URL = 'postgresql://user:passwort@localhost:5432/blog?schema=public';

JWT_SECRET = 'your JWT_SECRET';
```

- 初始化数据库

```bash
yarn prisma:init
```
