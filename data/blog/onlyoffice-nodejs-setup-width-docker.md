---
title: 如何使用 ONLY OFFICE 在你的 WEB 中集成 OFFICE 文档编辑功能
date: 2023/2/2 13:32:14
lastmod: 2023/2/7 22:18:22
tags: [Node.js, Docker, 开源]
draft: false
summary: 本文主要介绍了 ONLYOFFICE，以及使用 docker 在 Linux 部署ONLYOFFICE，并且使用 Nodejs 对接的过程。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03a950e9054a48f3ac0676f1ee48776a~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

在日常 WEB 开发过程中常常有附件管理的需求，而这些附件大部分是 OFFICE 文件，而对于这些办公文档，用户需要下载下来编辑，编辑完成后上传，而对于用户的改动，开发者还需要实现历史版本管理功能。若能够实现 Office 文档在线编辑功能，这将大大提高用户的协作效率，而这个功能对于普通开发者来说非常困难的，今天我将介绍一款开源的办公套件 ONLYOFFICE，它可以帮你在 WEB 中轻松集成 OFFICE 文档编辑功能。

## ONLY OFFICE 介绍

> ONLYOFFICE 是一个免费开源的协作办公套件，适用于 Windows、Linux 和 macOS。该套件包括 3 个主要微软 Office 的替代品（Word、Excel、PowerPoint）。也提供表单（Forms）生成器，PDF 查看器和文件转换器。

对于个人用户，我们完全可以使用 ONLYOFFICE 代替 Microsoft Office，它与 Microsoft Office 高度兼容，并且免费无广告，你可以在 ONLYOFFICE 官网上[下载](https://www.onlyoffice.com/download-desktop.aspx)桌面版本或者手机版本。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d36038ac042a4da68937930dfdb8c73d~tplv-k3u1fbpfcp-zoom-1.image)

ONLYOFFICE 除了能够代替 Microsoft Office，还拥有云端存储，多人实时编辑共享的功能。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62b8cd3ada7649a8ae57edb3b1c3e7da~tplv-k3u1fbpfcp-zoom-1.image)

在侧边底部，选择链接到云，通过简单的注册，就可以实现文档云端同步

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3acd52a521d44500a1bc302cf9f6191e~tplv-k3u1fbpfcp-zoom-1.image)

在这个 Tab 下新建的文档便会自动保存到云，只要登录相同的账号，我们就可以在多个设备之间共享文档。

云端的文档还可以协同编辑，我们只需要点击右上角的共享，添加一个链接，将这个链接发送给你的同事，你们就可以协同编辑。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57ef8b23523140068c19e2db8ad1fbbe~tplv-k3u1fbpfcp-zoom-1.image)

协同者只需要浏览器，就可以编辑，我们再也不用为了软件版本不兼容而烦恼，这大大提高了文档协同编辑的效率。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c8c6609e489467dbd253b7ae63c5d09~tplv-k3u1fbpfcp-zoom-1.image)

能够使用浏览器编辑，这一功能这得益于 ONLY OFFICE 是使用 HTML5 的 canvas 和 JavaScript 实现的。

## ONLY OFFICE 实现原理

想要在你的 web 中集成 ONLYOFFICE，我们得先要知道它的原理，下图来自于 ONLYOFFICE [官方文档](https://api.onlyoffice.com/editors/open)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4aacc5bed4d54eb3acb9a1fea6623fb7~tplv-k3u1fbpfcp-zoom-1.image)

1. 用户使用浏览器访问打开文档进行查看或者编辑；
2. 通过 url 上的 fileName 参数，使用 JavaScript API 将文档唯一标识符（key）以及文档发送到文档编辑器（editor）。
3. 文档编辑器（editor）向文档编辑服务（server）发送一个打开文档的请求。
4. 文档编辑服务从文档存储服务（document storage service）下载相对应的文档，并将文档转换为 Office Open XML 格式。
5. 准备就绪后，文档编辑服务（server）会将转化后的文档传输到基于浏览器的文档编辑器（editor）。
6. 文档编辑器提供编辑或者查看权限，对文档进行相应操作，执行保存。

因此实现这一功能需要有 2 部分组成

- 文档编辑器（document editor）
- 文档服务器（document server）

## 前端实现

对于前端来说实现很简单，只需要在 html 设置一个容器，并且引入文档编辑器的 api

```html
<div id="placeholder"></div>
<script
  type="text/javascript"
  src="https://documentserver/web-apps/apps/api/documents/api.js"
></script>
```

其中`documentserver` 是安装了 ONLYOFFICE Document server 的服务器的名称。

```js
new DocsAPI.DocEditor('placeholder', {
  document: {
    fileType: 'docx',
    key: 'Khirz6zTPdfd7',
    title: 'Example Document Title.docx',
    url: 'https://example.com/url-to-example-document.docx',
  },
  documentType: 'word',
})
```

JavaScript 部分只需要通过 `DocsAPI` new 一个 `DocEditor` 即可。

其中 `example.com` 是安装文档管理器和文档存储服务的服务器的名称。

## 安装 OnlyOffice

因此关键部分还是在 server 部分，为此我们要准备一台服务器, 我这里选择使用 CentOS、2 核 2GB 的服务器，其他 Linux 版本的安装，大家可以参考[官网](https://www.onlyoffice.com/zh/download-docs.aspx#docs-community)

安装方式我选择使用 Docker

前置条件：服务器可连接外网

### 安装 Docker

安装 Docker 我选择使用阿里云镜像安装，登录服务器后，在命令行中输入以下命令

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

等待几分钟后就可以安装成功。

我们可以使用 `docker -v`, 查看 docker 的版本

### 安装 OnlyOffice 社区版

在命令行中输入以下命令

```bash
sudo docker run -i -t -d -p 80:80 --restart=always onlyoffice/documentserver
```

- `-p 80:80` 表示端口映射，前者是宿主机端口，后者是容器内的映射端口。

- `--restart=always` 容器自动重启

- `onlyoffice/documentserver` 镜像名称

官方还建议将数据存放在 Docker 容器之外，因为这样可以新版本发布后，轻松更新 ONLYOFFICE Docs 而不会造成丢失数据。

因此需要使用下面命令

```bash
sudo docker run -i -t -d -p 80:80 --restart=always \
    -v /app/onlyoffice/DocumentServer/logs:/var/log/onlyoffice  \
    -v /app/onlyoffice/DocumentServer/data:/var/www/onlyoffice/Data  \
    -v /app/onlyoffice/DocumentServer/lib:/var/lib/onlyoffice \
    -v /app/onlyoffice/DocumentServer/db:/var/lib/postgresql  onlyoffice/documentserver
```

数据卷说明

- /var/log/onlyoffice 对于 ONLYOFFICE 文档日志
- /var/www/onlyoffice/Data 证书
- /var/lib/onlyoffice 用于文件缓存
- /var/lib/postgresql 对于数据库

首次执行，镜像需要下载，需要等待几分钟。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/353c1ea735bd45ca9d4ccd7104a89b30~tplv-k3u1fbpfcp-zoom-1.image)

安装成功后可以使用 `docker ps` 查看运行状态

接下来我们， 就可以使用 ip 访问 onlyoffice 的服务页面了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02f3a7f7ca984c86a9481e6e32e7030c~tplv-k3u1fbpfcp-zoom-1.image)

onlyoffice 很贴心地在欢迎页面上添加了 example 测试示例，按页面上的命令执行，启动测试示例，点击`Go To Example`, 就可以访问文档编辑器示例了

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55e844d7dfe1446dafdd1295e3b5d4db~tplv-k3u1fbpfcp-zoom-1.image)

点击左侧，便可以创建在线 Word、Excel、PowerPoint 等

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12003fd5f1e34293bfaa0055a0f8d531~tplv-k3u1fbpfcp-zoom-1.image)

## 在 Nodejs 中集成

接下来，我们需要在自己的程序中集成 onlyoffice。

> ONLYOFFICE Docs 旨在无缝适配您的网络应用程序，无论您的应用程序是用什么语言编写的，ONLYOFFICE 为流行的前端框架提供了在线编辑器集成和示例

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9345183b884f41688ac5edd43794dd99~tplv-k3u1fbpfcp-zoom-1.image)

我们可以在[API 官网](https://api.onlyoffice.com/editors/demopreview)下载 Nodejs Example

下载完成完成后, 进入程序目录，并且安装 npm 包

```bash
cd  Node.js Example
yarn install
```

接下来我们需要修改文档服务器地址 `config/default.json`

```json
"storageFolder": "./files"
"storagePath": "/files"
"siteUrl": "https://documentserver/"
```

documentserver 就是刚刚安装的 IP 地址。 storageFolder 和 storagePath 我们可以根据实际修改。

运行程序

```bash
yarn satrt
```

然后我们使用浏览器访问 `http://localhost:3000`

进入后的界面同 Docker Example 一致，但是我们创建一个新的文档，界面会提示以下错误。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1898f542426433490bdca45dd49b256~tplv-k3u1fbpfcp-zoom-1.image)

```text
The document security token is not correctly formed.
```

原因是从 7.2 版本开始， JWT 验证默认开启

如果在安装期间未添加自定义密钥，则会自动生成随机密钥。

![查看秘钥](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/daef7e0f48864857baec496d50154ea2~tplv-k3u1fbpfcp-zoom-1.image)

我们可以根据文档服务器欢迎页面上的提示，执行查看秘钥。

获得的秘钥修改到 `config/default.json` 中。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33c9c307808942b59279e9741a928470~tplv-k3u1fbpfcp-zoom-1.image)

修复完成后，我们再次创建文档，访问`http://localhost:3000/editor?fileName=new.docx`

此时页面会有以下错误提示`Download failed.`

![Download failed.](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4029bfd5a9d4077825c27b514fbf1ec~tplv-k3u1fbpfcp-zoom-1.image)

原因是，我们的 document server 安装在 docker 中。对于 docker 服务来说， `localhost:3000` 是不存在这个文件的。

因此我们需要通过本机 IP 访问。 真实生产环境上，我们会分配一个域名。使用 IP 或者域名访问就可以成功了。最后附上一张成功的截图。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ab1ae377b4b4f37881e8286066d6b7f~tplv-k3u1fbpfcp-zoom-1.image)

## 小结

本文我们没有介绍 Nodejs 文件读写的实现，其大部分代码都在 `app.js` 中，而是主要介绍了 ONLYOFFICE 部署和对接过程。

1. 使用开源软件 ONLYOFFICE 代替 Microsoft Office
2. 使用 docker 部署了 ONLYOFFICE 社区版 Document Server
3. 使用官方的 Nodejs Demo 对接 Document Server

当然本文只是对 ONLYOFFICE 做了一个简单的介绍，更多功能请大家参考 [ONLYOFFICE 官网](https://www.onlyoffice.com/blog/zh-hans/2023/02/onlyoffice-docs-7-3-released/)

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
