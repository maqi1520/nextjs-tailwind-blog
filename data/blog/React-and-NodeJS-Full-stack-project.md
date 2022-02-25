---
title: '使用 React 和 NodeJS 创建一个全栈项目'
date: '2021/11/25'
lastmod: '2022/1/14'
tags: [前端, Node.js]
draft: false
summary: '在本文中，我将使用 React 和 NodeJS 创建一个全栈项目。介绍下如何让 Node.js 作为 web 服务器来加载静态资源，如何让 React 程序可以直接调用 Node API。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6236799d10b46e798a8cc26e7e1d1e4~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

我们都知道 React 非常优秀并且非常出色，我们可以使用 create-react-app 快速搭建一个前端应用。
但是由于 React 构建出来的只是前端静态资源（如：HTML、CSS 、JS 等），往往不能独立部署，我们还需要一个 WEB 服务器，还需要调用 API；
在本文中，我将使用 React 和 NodeJS 创建一个全栈项目。介绍下如何让 Node.js 作为 web 服务器来加载 React 构建出的静态资源，如何让 React 程序可以直接调用 NodeJS API。

## 准备工作

在开始之前，请确保你的计算机上已经安装了 Node 和 NPM。

## 创建项目目录

首先我们用命令行创建一个 my-app 的目录，并且进入到 my-app

```bash
$ mkdir my-app
$ cd my-app
```

## 初始化 React 程序

然后使用 create-react-app 创建一个 React 程序，这部分是客户端的代码， 所以命名为 `client`

```bash
$ npx create-react-app client
```

## 使用 NodeJS 来实现我们的 API

创建 API 目录

```bash
$ mkdir api
$ cd api
```

初始化 nodeJS 项目

```bash
npm init -y
```

Express.js 是一个非常轻量的 Node.js 框架，安装 express。

```bash
npm i --save express
```

在 api 文件夹下，建立 `server.js`

```js
// api/server.js

const express = require('express')
const app = express()
app.use(express.json())

app.get('/', function (req, res) {
  res.send("It's working!")
})

app.listen(3000, () => {
  console.log('app listening on port 3000')
})
```

把 api 服务起在 3000 端口

在 `package.json` 中的 `scripts` 部分添加启动脚本

```json
"scripts":{
    "start": "node ./api/server.js"
}
```

然后运行, 访问 http://localhost:3000 ,就可以在浏览器中看到如下效果。

```
npm start
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a81c633b904447e39770ff10cb9cee9b~tplv-k3u1fbpfcp-watermark.image?)

## React 中访问 API 接口

先在 `./api/server` 修养接口返回数据是 json

```js
app.get('/', function (req, res) {
  res.json({ name: '张三' })
})
```

更改 `./client/src/app.js`

```js
import React, { useEffect, useState } from 'react'

export default function App() {
  const [name, setName] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000')
      .then((res) => res.json())
      .then((data) => setName(data.name))
  }, [])

  return <div>Hello {name}</div>
}
```

这个时候在页面上是看不到效果，看下 chrome 控制台会看到如下提示。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/047284ef641645cd94ef101088586691~tplv-k3u1fbpfcp-watermark.image?)

这是因为在发出 Fetch 请求时发生了跨域请求。为了解决这个问题：

### 方案一

更改接口允许跨域，我们需要在安装 `cors` 这个包:

```
npm install --save cors
```

更改 `./client/src/app.js`, 通过中间件的方式引用这个函数。

```js
const cors = require('cors')

app.use(cors())
```

然后停止服务， `npm start `重新启动 ，然后就可以看到效果了。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02a3c850cf5d4e81bf54fd07fc1486cc~tplv-k3u1fbpfcp-watermark.image?)

### 方案二

`create-react-app `支持接口代理设置

**开发环境**

在 client/package.json 设置

```json

proxy:localhost:3000

```

然后在 jsx 中就可以使用相对路径请求了

```js
useEffect(() => {
  fetch('/api')
    .then((res) => res.json())
    .then((data) => setName(data.name))
}, [])
```

**生产环境**

在 `serve.js `中增加以下代码：

```js
if (process.env.NODE_ENV === 'production') {
  // 把静态资源指向 `client/build`
  app.use(express.static(path.resolve(__dirname, '../client/build')))

  // 其他任何没处理的接口都返回 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  })
}
```

npm 安装 `cross-env`这个包，区分开发环境还是生产环境.

更改在 `api/package.json` 设置

```
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development node ./api/server.js",
    "start": "cross-env NODE_ENV=production node ./api/server.js"
  }
}
```

### 方案三

开发环境还是使用 proxy 代理，生产环境使用 nginx 反向代理实现。

本地我使用了 [docker-compose](https://docs.docker.com/compose/)

使用以下 `docker-compose.yml`

```
web:
  image: nginx
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
  ports:
   - "8080:80"
```

根目录下建一个 `nginx.config`

```bash
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;
    keepalive_timeout  65;
    gzip  on;

    upstream server {
        server server:3001;
    }
    upstream web {
        server web:3000;
    }

    server {
        listen 80;
        server_name  localhost;
        location / {
            proxy_pass http://web/;
        }

        location ^~ /api/ {
            proxy_pass http://server/api/;
        }
    }
}
```

启动容器服务

```
docker-compose up -d
```

然后访问 http://localhost:8080 ,就可以在浏览器中看到效果了。

## 最后

小伙伴们，你们会使用那种方案呢，欢迎评论区留言。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
