---
title: 三分钟 ChatGPT 接入钉钉机器人
date: 2023/3/16 18:27:23
lastmod: 2023/3/17 15:21:13
tags: [ChatGPT, JavaScript, Node.js]
draft: false
summary: ChatGPT 大家应该都已经用了一段时间了，功能非常强大，作为开发人员，我用它写文档、写日报、润色 OKR，知识搜索等等，它给我带来了极大的帮助，但我在使用过程中最大的痛点就是网络。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0dcb0b737c9c4c5f948c9fea03d97089~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

highlight: monokai-sublime
theme: vuepress

---

## 前言

ChatGPT 大家应该都已经用了一段时间了，功能非常强大，作为开发人员，我用它写文档、写日报、润色 OKR，知识搜索等等，它给我带来了极大的帮助，但我在使用过程中最大的痛点就是网络。

## 痛点

由于国内不能访问的原因，我们必须使用代理，而且必须选择日本或美国较远的节点，香港跟台湾是不能访问的，而在工作的时候，需要访问内网，因此我每天要在切换代理这件事上花不少时间。

现在我们可以在钉钉中直接对接 ChatGPT，再也不必为了切换网络而烦恼了。

## 原理

首先来说一下原理：

https://chat.openai.com/ 这个网站必须是国外节点才可以访问，而我们使用官方的 api，就可以使用香港节点访问。

比如我们使用以下代码，这样就可以在 Nodejs 中调用 ChatGPT API 了。

```js
const payload: OpenAIStreamPayload = {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 800,
  n: 1,
}

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
  },
  method: 'POST',
  body: JSON.stringify(payload),
})
```

上述代码中 OPENAI_API_KEY 需要[登录自己账号](https://platform.openai.com/account/api-keys)，自己创建一个。

![复制 OPENAI API_KEY](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4898ce71bf2a4940813336fb6e6c906f~tplv-k3u1fbpfcp-watermark.image?)

接下来我们需要准备一个可以直接访问 OpenAi API 的 Node.js 环境。

有没有一种简单快捷的方法来调用 ChatGPT API 呢？

那当然是用 Laf 了。

Laf 是一个完全开源的一站式云开发平台，提供了开箱即用的云函数，云数据库，对象存储等能力，让你可以像写博客一样写代码。

> GitHub：https://github.com/labring/laf

最重要的是云服务可用区在香港，那么我们就可以搭建一个自己的 ChatGPT 了。

## 实现步骤

首先需要登录  laf.dev，然后新建一个应用。

![创建应用](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2feda7251c64dd8b9fef305eebfdf1b~tplv-k3u1fbpfcp-zoom-1.image)

点击开发按钮进入开发页面。

![进入开发](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f82c56a9411f42b9a8788d06fbe097b9~tplv-k3u1fbpfcp-watermark.image?)

在 NPM 依赖面板中点击右上角的  `+`，安装 npm 包 chatgpt，**保存并重启：**

![安装npm依赖](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9be1b689382a4e67bf4625a5ba331232~tplv-k3u1fbpfcp-watermark.image?)

新建一个云函数，选 post，函数名称随便取

![新建云函数](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ba2977af61845abb7c29ddc184f256f~tplv-k3u1fbpfcp-watermark.image?)

然后再入以下代码

```js
import cloud from '@lafjs/cloud'
import axios from 'axios'
import { ChatGPTAPI } from 'chatgpt'

const dingtalk_robot_url =
  'https://oapi.dingtalk.com/robot/send?access_token=a5abc0f85c385aabd92f8bd8634b8bc543e7193ae70b688'

const sendDingDing = async (md) => {
  const sendMessage = {
    msgtype: 'markdown',
    markdown: {
      title: '掘金消息',
      text: md,
    },
  }
  return await axios.post(dingtalk_robot_url, sendMessage)
}

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const prompt = body.text.content
  const api = new ChatGPTAPI({ apiKey: cloud.env.OPENAI_API_KEY })

  let res = await api.sendMessage(prompt)
  console.log(res.text)

  sendDingDing(res.text)

  return
}
```

上面代码中，还有 2 步方需要修改下：

第一个是设置环境变量 `OPENAI_API_KEY`

![设置环境变量](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9701c4a6a8e4788914608b535b39457~tplv-k3u1fbpfcp-watermark.image?)

第二个是修改 `dingtalk_robot_url`， 这个钉钉机器人的回调地址。

## 钉钉机器人对接

新建一个只有你自己的个人群

![钉钉群助手](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a9ef31bb1d447d9811e0535ca0e772a~tplv-k3u1fbpfcp-watermark.image?)

点击群助手创建一个自定义的 `webhook`

![添加机器人](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/563496725bde41f68b0c81651e385e8b~tplv-k3u1fbpfcp-watermark.image?)

安全设置选择自定义关键词，输入掘金消息
![创建机器人](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cdbddfadcb934987878f6a48f1fb9773~tplv-k3u1fbpfcp-watermark.image?)

复制 `webhook` 地址，这个就是 `dingtalk_robot_url`, 更新到云函数中，保存并发布。

![复制云函数url](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a84e5598570943e7bd0b7d5344314cf8~tplv-k3u1fbpfcp-watermark.image?)

点击复制云函数 url，我们设置到钉钉机器人中

![设置钉钉机器人](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad6ee865d4f644a59d75cae69cd1d62e~tplv-k3u1fbpfcp-watermark.image?)

填入你的云函数地址，这样我们就可以在钉钉中 `@机器人`,它每次会将消息内容推送给原函数，云函数处理消息后，将消息推送给钉钉。

接下来我们就可以在钉钉中愉快地和 ChatGPT 对话了。

![对话演示](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67424a6f10954760accf7f43ee303cf0~tplv-k3u1fbpfcp-watermark.image?)

当然消息也会同步在手机中，我们也可以使用手机和机器人对话。

## 小结

缺点是这个机器人还不支持连续对话，因为钉钉机器人不支持消息 id 的记录，其实 ChatGPT 是支持理解上下文的。 只需要在 `ChatGPTAPI` 中传入 `parentMessageId` 就可以了。

```js
res = await api.sendMessage('What were we talking about?', {
  parentMessageId: res.id,
})
```

如果这个群聊只有一个人使用的话，我们可以将 `parentMessageId` 存入云数据库中，或云函数的共享中。

```js
cloud.shared.set('parentMessageId', 'id')
cloud.shared.get('parentMessageId')
```

这样就可以实现连续对话了。

好了，以上就是本文全部内容，如果对你有帮助，随手点个赞吧

参考 [《 三分钟拥有自己的 ChatGPT (从开发到上线)》](https://mp.weixin.qq.com/s/Z4dFYECnicvvTOWhuL8F-Q)
