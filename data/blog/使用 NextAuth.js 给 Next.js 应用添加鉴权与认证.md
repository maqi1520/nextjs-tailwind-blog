---
title: 使用 NextAuth.js 给 Next.js 应用添加鉴权与认证
date: 2022/10/18 00:12:49
lastmod: 2023/1/25 11:42:55
tags: [React.js]
draft: false
summary: 在上一篇文章中，我们使用 prisma 和 Next.js，创建了一个视频网站，本文将继续开发视频网站，实现邮箱登录、 Github 授权登录，以及密码登录。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fca150f8a98e4692ba770f4523171bf5~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

highlight: monokai
theme: vuepress

---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

在系统中要实现身份验证是一件比较麻烦的事情，比如集成邮箱登录，手机号登录，以及其他第三方登录等，但是有了[NextAuth.js](https://next-auth.js.org/ 'Next-auth.js')，一切就变得简单。正如官网说的添加身份验证，只要几分钟就可以实现。在上一篇文章中，我们使用 prisma 和 Next.js，创建了一个视频网站，但我们还没有实现用户的注册与登录，本文将继续开发视频网站，实现邮箱登录、 Github 授权登录，以及密码登录。那么，一起来看看吧！

> 文中涉及代码全部托管在 [GitHub 仓库](https://github.com/maqi1520/next-prisma-video-app 'GitHub 仓库代码')中。

## Next.js 应用接入 NextAuth

NextAuth.js 是 Next.js 应用程序的完整开源身份验证解决方案，专门为 Next.js 设计，NextAuth 的特点：

1. 灵活且易于使用，支持 OAuth1.0 OAuth2.0 和 OpenId 链接；
2. 灵活数据管理，可以不使用数据库，也可以选择使用 MySQL, MariaDB, Postgres, SQL Server, MongoDB 以及 SQLite。
3. 默认安全，默认 Cookie 机制，可开启 JSON Web Token；
4. NextAuth 推进无密码的登录机制
5. 支持 serverless 部署

### 安装

首先我们使用 yarn 安装 NextAuth.js

```bash
yarn add next-auth
```

### 授权 api

要通过 NextAuth.js 获得授权， 需要先创建一个`pages/api/auth/[...nextauth].ts` 文件，它包含了所有全局 NextAuth.js 配置。

```ts
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authOptions = {
  // 在 providers 中配置更多授权服务
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
}

export default NextAuth(authOptions)
```

我们先添加一种授权登录方式，首先是使用 GITHUB 登录

## Github 授权流程

![Github 授权流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/191317b9b9a64f73bedeed9a3ca2fc3d~tplv-k3u1fbpfcp-zoom-1.image)

我之前使用过 Nodejs 集成 Github OAuth 流程，大致要分为以上 6 个步骤，需要写不少代码和接口，但使用了 Next-auth.js， 就可以非常轻松的集成到我们的应用中，几乎不用写代码。

### 注册 GitHub OAuth Application

环境变量可以在 [Github 开发者](https://github.com/settings/applications/new)中申请，点击注册一个新 OAuth Application：

![注册 GitHub OAuth Application](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5404922894744ff8a65eb2fbf667af88~tplv-k3u1fbpfcp-zoom-1.image)

回调地址填`http://localhost:3000/api/auth/callback/github`

地址可以先填开发环境地址，待上前线前可以修改为正式域名地址，或者开发环境和生产环境单独申请。

![复制GITHUB_ID](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2dc458d20a6d472795e179a30738fe8b~tplv-k3u1fbpfcp-zoom-1.image)

注册成功过后，在页面上复制 `Client ID` 和 `Client secrets` 到 `.env` 文件中

```text
GITHUB_ID=你注册的 GITHUB_ID
GITHUB_SECRET=你注册的 GITHUB_SECRET
```

### 配置 `pages/_app.ts`

为了让所有页面能够获取到 `Session`， 我们需要在 `pages/_app.ts` 外层加`SessionProvider`

```ts
import { SessionProvider } from 'next-auth/react'
export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

## 客户端获取登录信息

然后我们就可以创建一个登录组件`components/login-btn.tsx`。

```tsx
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        <span className="mr-1">session.user.email</span>
        <button onClick={() => signOut()}>登出</button>
      </>
    )
  }
  return <button onClick={() => signIn()}>登录</button>
}
```

在首页引用登录组件，就可以使用 GITHUB 来登录了，一起看来看看效果吧。

![GITHUB 授权登录成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eae6bcd997904e5f82ba31afaa041640~tplv-k3u1fbpfcp-zoom-1.image)

**注意**：有时候会因为网络问题， GitHub 无法登录。我们可以设置 `NextAuthOptions` 的 `debug` 为 `true`，会在控制台看到以下错误信息:

![GITHUB 授权登录超时](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e26361ca0dc543bc948b08468db4eac0~tplv-k3u1fbpfcp-zoom-1.image)

原因是访问 GitHub 需要代理，需要将代理设置为全局模式，并且设置请求 `timeout` 时间，将超时时间延长。

```ts
GithubProvider({
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  httpOptions: {
    timeout: 50000,
  },
}),
```

登录成功后，我们看下页面打印出来的数据，包含 GitHub 登录账户的基本信息。

通过控制台我们可以发现，`useSession` 其实就是访问了`http://localhost:3000/api/auth/session`接口获取信息，这部分是在客户端实现的，那么在服务端可以获取到用户授权信息吗？

## SSR 页面获取登录信息

回到我们要开发的视频网站，还缺少个人视频管理页面，这个页面必须是当前登录用户才能访问，没授权，是不能访问的。

新建`pages/me.tsx`，用于用户管理自己的视频。

```tsx
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

export default function Page() {
  return <div>个人中心</div>
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}
```

此时访问 `http://localhost:3000/me` 若没有授权登录，则将自动跳转到首页。

看打印出的`session`值，其中没有 `User` 的 `id`，而我们的视频表关联的是 `UserId` ，因此我们需要将用户的授权信息同步到我们的数据表中。

## Prisma 适配

next-auth.js 为 prisma 提供了适配器，我们只需要按官网给出的步骤依次执行

1. 安装 prisma 适配器

```bash
yarn add @next-auth/prisma-adapter
```

2. 在 NextAuth.js 配置 prisma 适配器

```ts
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";
+ import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  //debug: true,
+  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth authentication providers...
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
+  callbacks: {
+    session: async ({ session, token, user }) => {
+      if (session?.user) {
+        session.user.id = user.id;
+      }
+      return session;
+    },
+  },
};

export default NextAuth(authOptions);
```

添加 `callbacks` 函数，将 `user` `id` 赋值给 `session` 中的 `user` `id`，方便后面接口中可以直接获取用户 `id`。

3. 添加 prisma Schema 中添加模型

```js
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

当我们将这些模型粘贴到 Schema 后，会看到 VSCode 中有错误提示

![Prisma Schema 错误提示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89d1c1d0b1bb4a4e857a9b81c7c4d3fe~tplv-k3u1fbpfcp-zoom-1.image)

原因是我们之前设计的用户表 `id` 是 `Int` 类型，跟当前的 `Sring` 类型不匹配，解决办法是将 `Int` 改成 `String`，最好的做法是所有表中的 `id` 类型改成统一。

3. 迁移 Schema，生成表

```bash
npx prisma migrate dev
```

执行完成后，我们刷新页面，重新登录页面，来看下效果

![session 包含 userId](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a95b766d31f437b97c9ed7627844bb9~tplv-k3u1fbpfcp-zoom-1.image)

`session` 中已经有了 `id`，这里我测试了下，将我 Github 默认邮箱改成另一个，也不会影响注册用户表中的信息，因为 `Account` 表中的唯一值是`provider + providerAccountId`。

### 服务端渲染我的视频

在 `session` 中可以获取 `userId`，那么我们就可以在 `getServerSideProps` 获取当前用户的视频了。

```ts
export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const data = await prisma.video.findMany({
    where: {
      authorId: session.user.id,
    },
    include: { author: true },
  })

  return {
    props: {
      session,
      data: makeSerializable(data),
    },
  }
}
```

这里有个问题，当我们获取 `user.id` 的时候， typescript 会提示错误，因为默认的 `User` 类型中是不包含 `id`

![TS 校验提示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45f3eb2d697b47a8a7b3795ce45d0271~tplv-k3u1fbpfcp-zoom-1.image)

所以我们需要重写下 next-auth 中 `Session` 的接口，新建 `types/next-auth.d.ts` 输入以下代码，就可以继承默认的 `Session` TS 类型接口了

```ts
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
```

添加完成后，在页面中使用 `useSession`, `unstable_getServerSession` 等获取到的 `Session` 不会 TS 类型报错了。

## 邮箱授权登录

有了 Github 授权登录，并且关联了数据库，那要加上邮箱授权登录，便是轻而易举。

首先安装 `nodemailer`，用于 Node.js 发送邮件

```ts
yarn add nodemailer
```

然后在 `pages/api/auth/[...nextauth].ts`引入并且配置 `EmailProvider`

```ts
import EmailProvider from 'next-auth/providers/email'

export const authOptions: NextAuthOptions = {
  //debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      //maxAge: 24 * 60 * 60, // 设置邮箱链接失效时间，默认24小时
    }),
    // OAuth authentication providers...
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  // ...
}
```

然后在 `.env` 文件中配置环境变量

```
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=NextAuth <noreply@example.com>
```

这里的 `EMAIL_SERVER` 中的 `username` 就是发件邮箱的账号，而 `password` 并不是邮箱密码，需要在邮箱设置中开启，这里我以 163 邮箱为例

![163 邮箱设置](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92f7009115f24795b663ba531dd36ae3~tplv-k3u1fbpfcp-zoom-1.image)

登录邮箱后，在邮箱设置中开启 POP3/SMTP/IMAP 服务，点击开启，这里会需要短信验证，验证会有一个授权密码，这个授权码就是 `password`，
最后面的服务地址和端口需要根据你最终选择的 POP3/SMTP/IMAP 服务来配置，下图是 126 邮箱的服务器配置。

![126邮箱服务器信息](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a94bc6fa2fb54eff97aab1e328fbdb82~tplv-k3u1fbpfcp-zoom-1.image)

配置完成后刷新浏览器就可以使用邮箱来完成登录了，登录的邮箱账号不能是发送邮件服务的账号，比如我设置的是发送邮件服务是 163 邮箱，那我注册的时候使用 QQ 邮箱。

![使用邮箱登录界面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e1f821360a94a489a9afd8a16e16901~tplv-k3u1fbpfcp-zoom-1.image)

点击 “sign in with Email” 后，你就会收到如下邮件，在邮箱中点击链接，便会自动授权登录成功。

![收到默认邮件模板](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e61723698e74d4a99e9d2f000be5f1d~tplv-k3u1fbpfcp-zoom-1.image)

登录成功后的，Session 中的信息跟我 Github 账号登录的信息是一致的，因为在数据库中，邮箱地址是唯一值。

![邮箱登录成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/876dbb24b4724554b756ebe51b547def~tplv-k3u1fbpfcp-zoom-1.image)

### 更改邮件模板

有些同学会说，发送的邮件主题太丑了，我们可以定制吗？

放心，Next-auth 帮我们考虑到了 , `EmailProvider` 支持自定义模板，我们需要配置 `sendVerificationRequest` 函数

```ts
import EmailProvider from "next-auth/providers/email";
...
providers: [
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    sendVerificationRequest({
      identifier: email,
      url,
      provider: { server, from },
    }) {
      /* your function */
    },
  }),
]
```

邮件模板函数可能会很大，可以将 `sendVerificationRequest` 提取为单独文件，然后再引入；

```ts
import { createTransport } from 'nodemailer'
import { SendVerificationRequestParams } from 'next-auth/providers/email'
import { Theme } from 'next-auth'

export async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const { identifier, url, provider, theme } = params
  const { host } = new URL(url)
  const transport = createTransport(provider.server)
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `${host} 注册认证`,
    text: text({ url, host }),
    html: html({ url, host, theme }),
  })
  const failed = result.rejected.concat(result.pending).filter(Boolean)
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
  }
}

/**
 *使用HTML body 代替正文内容
 */
function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params
  //由于使用
  const escapedHost = host.replace(/\./g, '&#8203;.')

  return `
<body>
  <div style="background:#f2f5f7;display: flex;justify-content: center;align-items: center; height:200px">欢迎注册${escapedHost},点击<a href="${url}" target="_blank">登录</a></div>
</body>
`
}

/** 不支持HTML 的邮件客户端会显示下面的文本信息 */
function text({ url, host }: { url: string; host: string }) {
  return `欢迎注册 ${host}\n点击${url}登录\n\n`
}
```

当然这里我简化了模板代码， 在真实场景中，我们也可以替换 HTML 文件来实现。

## 密码登录

密码登录 Next-auth 是不鼓励使用的，因为与密码相关的固有安全风险以及与支持用户名和密码具有额外复杂性。

使用密码登录需要使用 `CredentialsProvider`

```ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

export const authOptions: NextAuthOptions = {
  //debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // 登录按钮显示 (e.g. "Sign in with Credentials")
      name: 'Credentials',
      // credentials 用于配置登录页面的表单
      credentials: {
        email: {
          label: '邮箱',
          type: 'text',
          placeholder: '请输入邮箱',
        },
        password: {
          label: '密码',
          type: 'password',
          placeholder: '请输入密码',
        },
      },
      async authorize(credentials, req) {
        console.log(credentials)
        // TODO
        // const maybeUser= await prisma.user.findFirst({where:{
        //   email: credentials.email,
        //  }})

        // 根据 credentials 我们查询数据库中的信息
        const user = {
          id: '1',
          name: 'xiaoma',
          email: 'xiaoma@example.com',
        }

        if (user) {
          // 返回的对象将保存才JWT 的用户属性中
          return user
        } else {
          // 如果返回null，则会显示一个错误，建议用户检查其详细信息。
          return null
          // 跳转到错误页面，并且携带错误信息 http://localhost:3000/api/auth/error?error=用户名或密码错误
          //throw new Error("用户名或密码错误");
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: 'test',
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token, user }) => {
      if (session?.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
```

上面代码中，我们首先需要开启 JWT 模式，在 `authorize` 方法中我们可以根据用户所填的表单信息进行数据库查询，由于我们的数据库中没有密码字段，所以上面的代码中直接返回了一个固定 `user` 信息，那真实的流程应该是：邮箱登录——> 设置密码——>密码登录

**实现效果**:

![密码登录界面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69b4253a8cae4cb5b60a0dcbd3b1d345~tplv-k3u1fbpfcp-zoom-1.image)

## 自定义登录页面

有同学会说，这个页面怎么这么丑，既有中文也有英文呢？显然在国内是不合适的， Next-auth 帮我们考虑到了，它支持配置自定义页面。

在 `pages/api/auth/[...nextauth].ts` 添加 `pages` 参数就可以实现自定义

```ts
pages: {
    signIn: '/auth/login',
},
```

自定义界面 ，可配置 `signIn`，`signOut`，`error`，`verifyRequest` 和 `newUser`，在这里，我们只配置登录页面。

登录页面的 dom 结构可以参考默认的 dom 结构， 直接复制出来就可以了。

![查看默认登录界面dom](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7dbe3e136cf4bc1b5dc550832e41dba~tplv-k3u1fbpfcp-zoom-1.image)

我们可以看到 form 表单中，有个默认的隐藏域，提交了 `csrfToken` 的值，那么这个值该如何获取呢？

```tsx
import { getCsrfToken } from 'next-auth/react'

export default function SignIn({ csrfToken }) {
  return (
    <form method="post" action="/api/auth/signin/email">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <label>
        Email address
        <input type="email" id="email" name="email" />
      </label>
      <button type="submit">Sign in with Email</button>
    </form>
  )
}

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context)
  return {
    props: { csrfToken },
  }
}
```

`csrfToken` 可以通过导出的 `getCsrfToken` 方法获取，并且赋值给隐藏域 `csrfToken`，在提交表单的时候，就会自动提交该值。

最后我们来看下实现效果:

![自定义登录页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc4575f1b5ff491d94f555e9121c2cf2~tplv-k3u1fbpfcp-zoom-1.image)

是不是有国内 App 的风格了呢？这里我使用了 `@chakra-ui/react` 实现代码也很简单，这里就不贴了，感兴趣的小伙伴可以直接看我的 [github](https://github.com/maqi1520/next-prisma-video-app)。

还有些小伙伴会问，登录页面能否能做成弹窗呢？当然也可以。

```tsx
import { signIn } from 'next-auth/react'

export default function Login() {
  return (
    <button
      onClick={() =>
        signIn('credentials', {
          email: 'xiaoma@example.com',
          password: '1234',
        })
      }
    >
      登录
    </button>
  )
}
```

界面我们可以完全自定义，写成一个组件，只需要调用内置的 `signIn` 方法即可，它会帮我们自动添加 `csrfToken` 值。

## 小结

思考：国内 app 使用手机短信验证登录已经成为主流，结合前面的文章，我们该如何修改表，使用哪个 `providers` 来实现？相信你已经有了答案。

本文通过 NextAuth.js， 给我们的视频网站实现了邮箱登录、 Github 授权登录，以及密码登录。你学会了吗？若对你有帮助，记得帮我点赞。

## 后续

接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

- 使用 React query 给 Next.js 应用全局状态管理
- 使用 i18next 实现 Next.js 应用国际化
- 使用 Playwright 进行 Next.js 应用的端到端测试
- 使用 Github actions 给 Next.js 应用创建 CI/CD
- 使用 Docker 部署 Next.js 应用
- 将 Next.js 应用部署到腾讯云 serverless

你对哪块内容比较感兴趣呢？欢迎在评论区留言，感谢您的阅读。
