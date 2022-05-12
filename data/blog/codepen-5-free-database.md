---
title: '实现一个 Code Pen：（五）白嫖云数据库'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '本篇主要介绍如何使用 uniapp 中的云函数和云数据库，并且通过云函数 URL 化，来给外部应用访问。'
images: []
authors: ['default']
layout: PostLayout
---

## 前言

前面的文章中，我们配置好了编辑器，实现了 css、html、js 的编辑，并且可以在浏览器端编译代码，接下来我们需要实现数据存储的功能。再次提一下我的技术栈主要是 Next.js。我们知道使用 Next.js [vercel](https://vercel.com/ 'vercel') 就可以帮我们自动部署，vercel 提供了网站托管和 serverless（函数即服务）的能力， 但是 vercel 没有提供数据库存储的能力，那么我需要买数据库吗？

## 使用 Uniapp 的目的

很多人可能使用过 uniapp，来开发小程序，使用的是 Vue 技术栈，并且写一套代码就可以打包成多端和跨端的应用，可以极大的加快开发速度，如果选择使用阿里云，可以有 50 个免费项目，简直就是白嫖，在这里我只使用云函数和云数据库。

## 云函数开发

首先需要下载 `HbuildX` ，然后注册登录，新建项目，这些我就不展开讲了，大家可以自行查官方教程。

![uniCloud web 控制台](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1936f89da56946efa15b3adc4675140a~tplv-k3u1fbpfcp-zoom-1.image)

并且关联好云服务空间，一个项目中可以有 50 个云函数，由于我之前的项目没几个云函数，所以我这里关联的是另外一个项目 [mdx-editor](https://editor.runjs.cool/ 'mdx-editor')

选择 uniCloud 目录右键，可以打开 uniCloud web 控制台。

![创建空表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4437f1bc7af24926a91887e91c51216c~tplv-k3u1fbpfcp-zoom-1.image)

点击云数据库，创建空表，命名成 pen

![新建云函数](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/889bb9c29a544f6ca901aa65ea85d090~tplv-k3u1fbpfcp-zoom-1.image)

选择 clouldfunctions 右键选择新建云函数。

输入云函数代码

```js
'use strict'
const db = uniCloud.database()

exports.main = async (event, context) => {
  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters.id
    const res = await db.collection('pen').doc(id).get()
    if (res) {
      return res.data[0]
    }
  }
  const data = JSON.parse(event.body)

  const timeStamp = new Date().getTime()
  let result = await db.collection('pen').add({
    ...data,
    createTime: timeStamp,
  })

  if (result.id) {
    return {
      ok: true,
      id: result.id,
    }
  }
  return {
    ok: false,
    msg: '异常错误',
  }
}
```

在这段代码中我将查询和添加的逻辑都写在一个云函数中，如果请求是 get，那就是查询，否则就是添加。

![上传部署](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/474b8206cba54066bc56f55d03869f5d~tplv-k3u1fbpfcp-zoom-1.image)

保存代码后选择上传部署，至此云函数开发完成，那么要如何在我们的项目中对接呢？

## 云函数 URL 化

![云函数列表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/260b3ce8d80a438299fc69b13c1d552d~tplv-k3u1fbpfcp-zoom-1.image)

打开 uniCloud web 控制台，点击上传云函数右侧的详情按钮

![云函数 URL 化](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e15127e4547e4dfaa18a6387de62c51e~tplv-k3u1fbpfcp-zoom-1.image)

在最下面云函数 URL 化，填写 PATH，保存成功后，复制整个 URL， 有了这个 URL 后就可以在我们 web 应用中访问了。但如果是直接用浏览器访问这个 URL，浏览器会下载一个 JSON，是不可用的。

## 保存数据

我们使用 post 接口保存数据。

```js
const [state, handleSave] = useAsyncFn(async () => {
  const response = await window.fetch(process.env.NEXT_PUBLIC_API_URL + '/api/pen', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result = await response.json()

  Router.push(`/pen/${result.id}`)
  return result
}, [data])
```

在上面代码中，将云函数的域名设置到环境变量中，方便以后迁移和部署。我们使用 react-use 中的 `useAsyncFn`, 这个 hook 将请求状态和返回结果保存在 state 中，点击保存按钮，执行 `handleSave` 就可以提交数据。

![code editor 保存数据](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e8b05dcbca24f54b800410f4033174a~tplv-k3u1fbpfcp-zoom-1.image)

以下几个字段是我们要保存的数据，这些数据从 state 中取就可以了。

```js
handleSave({
  html: '...',
  css: '...',
  js: '...',
  scripts: [],
  styles: [],
  cssLang: 'css',
  jsLang: 'babel',
  htmlLang: 'html',
  name: '玻璃拟态',
})
```

![没配置跨域，403 错误](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea118ab4034049cb9f24a0324ea834fc~tplv-k3u1fbpfcp-zoom-1.image)

当我点击保存的时候，浏览器会报 403 错误，原因是我们请求跨域了，所以我们需要在 uniCloud web 控制台添加运行跨域的域名。
![跨域配置](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8be6e18469a7473180dbaf1c9e1eb900~tplv-k3u1fbpfcp-zoom-1.image)

再次点半保存，数据保存成功。

保存成功后，经返回的 id 传到 url 上，跳转到`/pen/${id}`，查看详情页面。

## 查询数据

我们可以使用同样的方法查询数据。为了体现 next.js 服务端优势，对 SEO 更友好，我们可以在 `getServerSideProps` 中获取数据。

```js
export async function getServerSideProps({ params, res, query }) {
  if (params.id && params.id[0] === 'create') {
    res.setHeader('cache-control', 'public, max-age=0, must-revalidate, s-maxage=31536000')
    return {
      props: {},
    }
  } else {
    try {
      const initialContent = await get({
        id: params.id[0],
      })

      res.setHeader('cache-control', 'public, max-age=0, must-revalidate, s-maxage=31536000')

      return {
        props: {
          id: params.id[0],
          initialContent,
        },
      }
    } catch (error) {
      return {
        props: {
          errorCode: error.status || 500,
        },
      }
    }
  }
}
```

上面代码中，如果 id 等于`create` 的时候就不需要查询数据。

下面代码是服务端请求数据的代码

```js
import fetch from 'node-fetch'

export function get({ id }) {
  return fetch(process.env.NEXT_PUBLIC_API_URL + '/api/pen?id=' + id, {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    return response.json()
  })
}
```

由于 vercel 的 nodejs 版本是 14，所以数据请求，还不支持 fetch，我们还需要安装 `node-fetch`

## 小结

预览地址：https://code.runjs.cool/pen/create

代码仓库：https://github.com/maqi1520/next-code-pen

本篇主要介绍如何使用 uniapp 中的云函数和云数据库，并且通过云函数 URL 化，来给外部应用访问，其中保存数据和请求数据部分是常规代码，熟悉 next.js 和 react 的同学都没问题，相对比较简单。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
