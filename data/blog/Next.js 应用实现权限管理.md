---
title: Next.js 应用实现权限管理
date: 2022/11/14 22:48:39
lastmod: 2023/1/25 11:42:28
tags: [React.js]
draft: false
summary: 今天我们就聊一聊权限系统的设计与实现，要在网站中实现复杂的权限管理对应新手来说，这可能会是比较困难的，但权限系统是软件中不可或缺的部分，我们只要掌握一个套路，就会变得非常简单，一起来看看吧！
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e6342307e9244edb7650de27adf8eda~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

在前面的文章中[《使用 NextAuth.js 给 Next.js 应用添加鉴权与认证》](https://juejin.cn/post/7155514465591984136 '使用 NextAuth.js 给 Next.js 应用添加鉴权与认证')，我们使用了 Github OAuth 和邮箱认证登录，我们的视频网站就有了用户系统，和用户系统离不开的，便是权限系统，今天我们就聊一聊权限系统的设计与实现，要在网站中实现复杂的权限管理对应新手来说，这可能会是比较困难的，但权限系统是软件中不可或缺的部分，我们只要掌握一个套路，就会变得非常简单，一起来看看吧！

## 权限区分

因为有了权限，我们可以在一个系统中实现各种各样的功能，系统也会变得庞大而复杂。一般可以将权限分为“功能权限”、“数据权限”和“字段权限”。

功能权限：用户具有哪些权利，例如特定数据的增、删、改、查等；比如在一个视频网站中，超级管理员拥有对所有视频的审核权限，而普通用户只能拥有对着自己视频的编辑和删除权限。功能权限需要前后端共同实现；

数据权限：用户可以看到哪些范围的主数据。比如视频网站中，VIP 用户可以看到 VIP 视频，而非 VIP 用户只能看普通视频。数据权限主要是后端实现；

字段权限：在特定的数据表中，可以看到哪些字段；比如普通用户能够看到其他用户的基本信息，但是看不到其它人的账户信息。字段权限也主要是由后端实现；

## 权限系统设计

我们可以将网站中的功能按角色划分，根据不同的角色来指定不同的权限，这便是大部分网站的实现方式。
比如在视频网站中我们可以将角色划分为：

**前台角色**

- 普通用户
- VIP 用户

我们可以在数据库中加入 2 个字段区分，User 表加入 `isVip`， Video 表加入 `vip`，prisma Schema 定义如下：

```js
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  isVip         Boolean
  emailVerified DateTime?
  Video         Video[]
}

model Video {
  id    Int    @id @default(autoincrement())
  title String @unique
  vip        Boolean
  desc       String?
}
```

那么我们通过接口就可以查出 Vip 视频。

```ts
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: 'You must be logged in.' })
    return
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.id as string,
    },
  })

  if (!user.isVip) {
    res.status(401).json({ message: 'You are not vip user' })
    return
  }
  const videos = await prisma.video.findMany({
    where: {
      vip: true,
    },
  })
}
```

上面代码中，先通过 session 获得用户 id，再查询用户是否为 vip，若为 vip 则查询出 vip 视频，不是则返回 401。

**后台角色**

- 视频管理员：用于视频审核，对不合法的视频进行下架。
- 超级管理员：拥有所有权限，用户管理、视频管理等

> 备注：由于系统比较简单，我们将前台后台的用户系统使用同一个，只要在数据库中设置一个字段`isAdmin` ，然后在页面上根据这个字段显示后台管理入口，就可以实现管理视频啦。

![数据表关系图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/987343ea05ee414888615ed917857b8e~tplv-k3u1fbpfcp-zoom-1.image)

一般情况下，我们需要给网站添加 2 张表：一张是角色表（Rule）、一张是权限表（Permission），角色和权限的关系是多对多的关系，一个角色可以有多个权限，一个权限也可以赋给多个角色， 因此需要加入第三章表关联表，在 [Prisma](https://www.prisma.io/ 'NodeJS ORM') 中，关联表一般使用 `TablesOnTables`的形式设计，使用 `@relation`关联表中的附键，下面代码就是 prisma Schema 代码

```js
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  roleId        String?
  role          Role?     @relation(fields: [roleId], references: [id])
}

model Role {
  id                 String               @id @default(cuid())
  name               String
  PermissionsOnRoles PermissionsOnRoles[]
  User               User[]
}

model Permission {
  id                 String               @id @default(cuid())
  pid                String?
  name               String
  code               String
  PermissionsOnRoles PermissionsOnRoles[]
}

model PermissionsOnRoles {
  role         Role       @relation(fields: [roleId], references: [id])
  roleId       String
  permission   Permission @relation(fields: [permissionId], references: [id])
  permissionId String
  assignedAt   DateTime   @default(now())

  @@id([roleId, permissionId])
}
```

在 `prisma/schema.prisma`文件中修改 schema， 修改完 prisma schema 后，执行以下命令，我们便可以往数据库迁移，生成真实的表。

```bash
npx prisma migrate dev
```

执行后，会在 `prisma/migrations/*/migration.sql` 文件下生成 Sql 语句，效果如下。

![生成的sql语句](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8c0e3f416a24adea432ab42fe9a38bd~tplv-k3u1fbpfcp-zoom-1.image)

系统中，一般权限数据都数据库内置的，因此需要新建一个`seed.ts`文件，可以方便我们往默认数据库插入数据

```ts
import { PrismaClient } from '@prisma/client'

// initialize Prisma Client
const prisma = new PrismaClient()

async function main() {
  await prisma.permission.createMany({
    data: [
      {
        name: '用户管理',
        code: 'user_management',
      },
      {
        name: '视频管理',
        code: 'video_management',
      },
    ],
  })

  await prisma.role.create({
    data: {
      name: '超级管理员',
      permissions: {
        create: [
          {
            assignedAt: new Date(),
            permission: {
              connect: {
                code: 'video_management',
              },
            },
          },
          {
            assignedAt: new Date(),
            permission: {
              connect: {
                code: 'user_management',
              },
            },
          },
        ],
      },
    },
  })

  await prisma.role.create({
    data: {
      name: '视频管理员',
      permissions: {
        create: [
          {
            assignedAt: new Date(),
            permission: {
              connect: {
                code: 'video_management',
              },
            },
          },
        ],
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
```

执行`npx ts-node prisma/seed.ts`，就可以初始化角色和权限数据了，上述代码中我们设置了 2 个角色，分别为超级管理员和视频管理员，添加了 2 个权限分别为视频管理和用户管理并且设置了唯一键 code，code 可以拥有前端权限的判断。

## 后端接口设计

有了数据库和数据我们便可以实现一个接口，“用户信息接口”，我们将它定义为`/api/user/me`，用于返回权限信息

新建一个`pages/api/me.ts` 文件, 代码如下

```ts
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { makeSerializable } from '@/lib/util'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: 'You must be logged in.' })
    return
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.id as string,
    },
  })

  const permissionsOnRoles = await prisma.permissionsOnRoles.findMany({
    where: {
      roleId: user.roleId,
    },
  })
  const ids = permissionsOnRoles.map((item) => item.permissionId)

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  return res.json({
    user,
    permissions,
  })
}
```

上面的代码中，查询步骤为：

- 先通过 session 获得用户 id
- 通过用户 id 查询用户信息，获得角色 id
- 通过角色 id 查询关联表，获得权限 id
- 再通过权限 id 查询权限信息。

以上代码便是多对多查询过程，访问接口，就可以获得当前用户的权限信息了。

![权限接口查询](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a8504e2079f45cbb9369c6296283234~tplv-k3u1fbpfcp-zoom-1.image)

那么前端就可以通过该接口来判断功能权限了，至此后端权限部分就完成了。

## React 中实现权限管理

在 React 中实现状态管理，我们可以在整个 App 组件（跟组件）渲染前选请求`me`接口，然后通过 `React Context` 将 permission 信息进行全局状态管理，这样我们就可以在任意组件获取权限信息，进行权限判断了。

```tsx
import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { createBrowserRouter, RouterProvider, Route, Outlet } from 'react-router-dom'

const PermissionContext = React.createContext([])

const usePermission = function () {
  return useContext(PermissionContext)
}

function Permission({ code, children }) {
  const permissions = usePermission()
  if (permissions.includes(code)) {
    return children
  }
  return null
}

export default function App() {
  const [permissions, setPermissions] = React.useState([])

  useEffect(() => {
    axios.get('/api/user/me').then((res) => {
      const permissions = res.data.map((item) => item.code)
      setPermissions(permissions)
    })
  }, [])

  return (
    <div>
      <PermissionContext.Provider value={permissions}>
        <RouterProvider router={router} />
      </PermissionContext.Provider>
    </div>
  )
}
```

上面代码中，我们创建了一个我们定义了一个`Permission`组件，那么在项目中，只要在要判断权限的地方使用该组件，若没有权限，则会不显示。我们还定义了一个`usePermission` 自定义 hooks，这样在后续开发中，若要使用到权限，我们就可以直接使用这个 Hooks，界面 UI 也可以重新定义了。

比如在 React-router 路由（V6）中，直接嵌套一个`Permission` 组件便可以实现权限控制了。

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <div>首页</div>,
  },
  {
    path: '/login',
    element: <div>登录</div>,
  },
  {
    path: '/admin',
    element: (
      <div>
        后台管理 <Outlet />
      </div>
    ),
    children: [
      {
        path: 'user',
        element: (
          <Permission code="user_management">
            <div>用户管理</div>
          </Permission>
        ),
      },
      {
        path: 'video',
        element: (
          <Permission code="user_management">
            <div>视频管理</div>
          </Permission>
        ),
      },
    ],
  },
])
```

## Next.js 实现权限管理

在 Next.js 中，我们可以同 React 一样的方式来实现权限控制。若是服务端渲染的页面，我们也可以在服务端控制。

```js
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { makeSerializable } from '@/lib/util'

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/403',
        permanent: false,
      },
    }
  }

  //const permissions =  prisma query

  if (!permissions.includes('video_management')) {
    return {
      props: {
        errorCode: 403,
      },
    }
  }

  const data = await prisma.video.findMany({
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

同接口的方式一致，我们也可以在 `getServerSideProps` 通过获得 `session`，然后获得用户权限，再通过权限判断，是否让页面显示 403。

那如果有多个页面有需要权限判断，该怎么办呢？我们可以在根目录下建立一个`middleware.js`, 中间件会在每个请求的时候执行。

```js
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  // 如果url不应该受到保护，请尽早返回
  if (!req.url.includes("/protected-url")) {
    return NextResponse.next()
  }

  const session = await getToken({ req, secret: process.env.SECRET })
  if (!session) return NextResponse.redirect("/api/auth/signin")
  ...

  // 如果授权通过则继续。
  return NextResponse.next()
}
```

在中间件中，我们也可以获得`session`，那么与 api 接口一样，就可以在中间件中判断权限信息了，有一点需要注意的是，Url 不需要权限判断，我们应该尽早返回，这样可以避免多余的查询。

## 小结

本文以视频网站为例，讲解了权限系统的设计与实现，主要涉及到的知识点有：

- 后端基于角色表和权限表，多对多表结构设计
- Prisma 中实现多对多关系查询
- 前端使用 React Context 和 自定义 hooks 实现全局状态管理
- 利用 Next.js 的 [middleware](https://gist.github.com/balazsorban44/30e2267fe1105529f217acbe3763b468 'NextAuth.js Auth Middleware for Next.js 12') 也可以获得 session，并且用于权限判断。

好了，以上就是本文的全部内容，你学会了吗？接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏，感谢您的阅读。
