---
title: 'Remix 对比 Next.js ：一文深度解析'
date: '2022/2/22'
lastmod: '2022/2/22'
tags: [React.js]
draft: false
summary: '在本文中，我将对比 Next.js 和 Remix 的一些重要特性，来帮助您选择最佳的React 服务端渲染框架。'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab804e752d2a4e03a2369721349b19bc~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

Next.js 是用于服务器端渲染的最流行的 React 框架之一，它流行了很多年，并且被许多开发者所喜爱。

然而，随着 Remix 的开源引入, 开发人员已经开始怀疑哪个框架对他们的应用程序来说更加友好，所以，在本文中，我将对比 Next.js 和 Remix 的一些重要特性，来帮助您选择最佳框架。

## 路由系统

当谈到路由时，Remix 和 Next.js 之间有许多相似之处。例如, 它们都遵循基于文件的约定式路由系统，并支持动态路由。

**相同点**
在 Next.js 中, 当你在 `/pages` 文件夹下创建一个文件, 它将自动设置为路由。

```bash
pages/index.js ==> /

pages/users/index.js ==> /users

pages/users/create.js ==> /users/create
```

Remix 也会自动创建路由. 但是, 你需要在`app/routes` 文件夹下创建文件。

```bash
app/routes/index.js ==> /

app/routes/users/index.js ==> /users

app/routes/users/create.js ==> /users/create
```

**差异性**
Remix 路由是基于 react-router 构建的, 并且你可以直接使用 React Hooks, 比如 `useParams` 和 `useNavigate`。 另一方面, Remix 内置支持嵌套布局的嵌套路由，而 Nest.js 则不支持.

## 数据加载

web 应用程序中有几种数据加载技术。分别是:

- （SSR）Server-side rending in the runtime 服务端渲染.
- （SSG） Static Site Generation 静态生成 + (ISR) Incremental Static Regeneration 增量静态生成 .
- （CSR）Client-side rending at runtime 客户端渲染.
- 混合服务端渲染和客户端渲染和静态生成

在 Next.js 中， 开发人员可以自由的选择上述所有方法技术从加载数据，比如我的[博客](https://maqib.cn/)就是使用了 SSG 将文章详情页打成静态资源，新写的文章就使用了增量静态生成，不需要再次打包。

你可以使用`getServerSideProps`这个方法直接获取数据，并且可以通过 `getStaticProps` 和 `getStaticPath` 在构建时从服务器端加载数据。以下代码示例显示如何使用 `getServerSideProps` 加载数据.

```jsx
export const getServerSideProps = async ({ params, query }) => {
  const id = params.id
  // 通过 url 上的id 获取数据
  // const data= await db.res.query(id)
  return { props: { id, Data } }
}

export default function age({ id, data }) {
  return (
    <div>
      <h1>url 上的id 参数: {id}</h1>
      <h2>根据id 插件结果是: {data}</h2>
    </div>
  )
}
```

在 Remix 中 ，只支持 SSR 和 CSR，只支持这 2 种。

你必须导出一个 `loader` 在路由页面，然后使用 `useFetcher` 这个 Hook 从服务端渲染中获取数据

```jsx
import { useLoaderData } from 'remix'

export let loader = async ({ params, request }) => {
  const id = params.id
  // 通过 url 上的id 获取数据
  // const data= await db.res.query(id)
  return { id, data }
}

export default function Page() {
  let { id, dataLimit } = useLoaderData()
  return (
    <div>
      <h1>url 上的id 参数: {id}</h1>
      <h1>根据id 插件结果是: {data}</h1>
    </div>
  )
}
```

Next.js 支持服务器端渲染 (SSR) 、静态站点生成 (SSG) 、增量静态生成 (ISR) 和 CSR (客户端渲染) . 对比，Remix 它仅支持 SSR 和 CSR。

## 使用 Sessions and cookies

在 Next.js 中没有直接可以操作 cookie 的内置函数。但是像 Cookie.js 这样的流行库可以与 Next.js 或 NextAuth.js 一起使用，比如将用户身份验证数据保存在 cookie 中。

Remix 支持开箱即用的方法操作 cookie 。您可以通过调用函数来生成 cookie，然后序列化或解析数据以存储或读取它.

以下来自 Remix 的代码片段显示了如何在 Remix 中创建用于管理浏览器 cookie 的逻辑函数。

```javascript
import { createCookie } from 'remix'

const cookie = createCookie('cookie-name', {
  expires: new Date(Date.now() + 60),
  httpOnly: true,
  maxAge: 60,
  path: '/',
  sameSite: 'lax',
  secrets: ['s3cret1'],
  secure: true,
})
```

## 样式

在样式方面，Remix 与 Next.js 略有不同。Remix 提供了一种内置技术，可以使用`links`方法动态添加样式，而 Next.js 支持 Styled-JSX 作为 CSS in JS 方案或者使用 css modules，全局样式只能写在最外层的 app.js 中

```jsx
function Home() {
	return (
		<div className="container">
  	<h1>My Cart in Next.js</h1><p>Some paragraph</p><style jsx>
    	{'
      .container {
        margin: 20px;
      }
      p {
        color: blue;
      }
    `}
   </style></div>
 )
}

export default Home
```

Remix 使用一种简单的方法向页面添加样式，使用`<link rel ="stylesheet">` 标签 。当页面切换到该页面下自动加载样式原先页面下的样式自动删除，下面的代码片段展示了如何使用`links`函数以在 Remix 中加载样式表。

```javascript
export function links() {
  return [
    {
      rel: 'stylesheet',
      href: 'https://test.min.css',
    },
  ]
}
```

通过上述代码，会自动在页面中装载和卸载 link。

## 表单

Next.js 非内置，需要使用 ajax 处理。

Remix 提供了内置表单功能
通过 `<button name="_action">`代替 `<button name="action">` 然后可以在 action 中, 使用 `formData.get("\_action")` 获取数据

```jsx
export async function action({ request }) {
  let formData = await request.formData()
  let action = formData.get('_action')
  switch (action) {
    case 'update': {
      // do your update
      return updateProjectName(formData.get('name'))
    }
    case 'delete': {
      // do your delete
      return deleteStuff(formData)
    }
    default: {
      throw new Error('Unexpected action')
    }
  }
}

export default function Projects() {
  let project = useLoaderData()
  return (
    <>
      <h2>Update Project</h2>
      <Form method="post">
        <label>
          Project name: <input type="text" name="name" defaultValue={project.name} />
        </label>
        <button type="submit" name="_action" value="create">
          Update
        </button>
      </Form>

      <Form method="post">
        <button type="submit" name="_action" value="delete">
          Delete
        </button>
      </Form>
    </>
  )
}
```

# 5. 部署

Next.js 可以在任何服务器上安装并且运行 `next build && next start`，并且它支持了 serverless 模式, **Netlify** 团队也在写关于 serverless 的适配.

Remix 也可以在任何平台上运行，并与任何系统接口。因此，Remix 是 HTTP 服务器请求处理程序，允许您使用任何服务器。当您构建 Remix 应用程序时，系统会询问您要在哪里部署它，在撰写本文时，会以下选项:

- Remix App Server
- Express Server
- Netlify
- Cloudflare Pages
- Vercel
- Fly.io
- Architect (AWS Lambda)

## 横向对比

|                        | Next.js                                      | Remix                                          |
| ---------------------- | -------------------------------------------- | ---------------------------------------------- |
| SSG 静态站点生成       | ✅ 内置                                      | 不支持                                         |
| SSR 服务器端渲染       | ✅ 内置 `getServerSideProps`                 | ✅ 通过 loader                                 |
| API 路由               | ✅pages/api/ 目录下                          | Remix 就是路由，你可以更加灵活去进行自定义路由 |
| Forms 表单             | 非内置                                       | ✅ 内置，且功能强大                            |
| 基于文件系统的路由管理 | ✅ 页面级                                    | ✅ 组件级                                      |
| 会话管理               | 非内置                                       | ✅ 内置 Cookie、Sessions                       |
| 禁用 JS                | 未提供充分支持                               | ✅ 静态页面路由                                |
| 样式                   | ✅ 提供了全局及组件级样式支持 TailwindCSS 等 | 路由级 CSS 装载和卸载                          |
| 嵌套布局               | 不支持                                       | ✅ 内置                                        |
| i18n 国际化            | ✅ 内置                                      | 非内置                                         |
| 图片优化               | ✅ 通过 next/image 组件                      | ✅ 通过简单转换、备选质量等方式                |
| 谷歌 AMP               | ✅ 内置                                      | 非内置                                         |
| 适配器                 | Node.js Request 和 Response 接口             | Fetch API Request 和 Response 接口             |
| Preload                | 链接自动                                     | 非自动                                         |
| 异常处理               | 创建 404，500 等页面                         | 使用 ErrorBoundary 组件局部抛错                |
| Polyfill               | fetch、Object.assign 和 URL                  | fetch                                          |

# 小结

### 适用场景 Next.js

静态网站。这是其最大优势，配合 Tailwind css 可以更加灵活的制作出样式优美的页面及组件，拥有着较为完善的生态圈。

适合快速上手做项目。

### Remix

管理后台，对于数据的加载、嵌套数据或者组件的路由、并发加载优化做得很好，并且异常的处理已经可以精确到局部级别。

或许是下一代的 Web 开发框架，需要折腾。

总体而言，Remix 是一个强大的框架，它将在 2022 年变得更加普遍。但是，在处理生产级应用程序时，使用 Next.js 将是显而易见的选择，因为它已经建立并得到社区的支持。

## 参考

- [网站的未来：Next.js 与 Remix](https://segmentfault.com/a/1190000041050654)
- [Remix vs. Next.js: A Detailed Comparison](https://blog.bitsrc.io/remix-vs-next-js-a-detailed-comparison-6ff557f7b41f)

本文主要翻译上述文章，但是上述文章存在不全面的地方，我做了修改和补充。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

## 推荐阅读

[“和 loading 界面说 ByeBye”—— Remix 颠覆式预加载解析](https://mp.weixin.qq.com/s/nCXRXPZvyhZFIGlyfdvfAQ)
