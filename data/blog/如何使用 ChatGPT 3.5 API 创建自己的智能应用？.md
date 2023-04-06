---
title: 如何使用 ChatGPT 3.5 API 创建自己的智能应用？
date: 2023/4/3 23:57:20
lastmod: 2023/4/6 09:03:51
tags: [React.js, OpenAI]
draft: false
summary: 本文介绍了 openai 的 api 使用方法，以及如何使用 openai 的 playground 生成需要的 messages 信息。并且通过一个 Next.js 实战例子，结合 ChatGPT
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0792a1f5176f4617b6c6829e3c62bac0~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

OPEN AI 的开放 API 可以说是前端开发者的福利，我们只需要调用 api，就可以创建一个智能应用，
在上一篇文章中，我们介绍了《基于 ChatGPT API 的划词翻译浏览器脚本实现》，使用的模型是 `text-davinci-003` 也就是文本补全模型，今天我们将使用 `gpt-3.5-turbo` 模型来实现一个场景化的智能应用。

## OPEN AI API 介绍

### 自动完成 API

`POST https://api.openai.com/v1/completions`

以下是自动完成 API，有了 OPENAI_API_KEY 之后，我们只需要传入 prompt

```js
const OPENAI_API_KEY = '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'

const prompt = `Translate this into Chinese:
        hello world`
const res = await fetch('https://api.openai.com/v1/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 1000,
    temperature: 0,
  }),
})
const response = await res.json()

const result = response.choices[0].text
```

### 对话 API

`POST https://api.openai.com/v1/chat/completions`

由于自动补全 API 只能传入一个参数 prompt，AI 不能够理解上下文的场景，因此 gpt-3.5+ API 是为了让 AI 能够支持基于一组对话来返回数据。

在 Node.js 中可以使用以下代码来实现。

```js
const OPENAI_API_KEY = "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";

const prompt = [...];
const res = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 500
  }),
});
const response = await res.json();

const result = response.choices[0].message
```

以下是官网给出 messages 例子

```js
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Who won the world series in 2020?' },
  { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
  { role: 'user', content: 'Where was it played?' },
]
```

- 每一个 message 由 `role` 和 `content` 组成。
- `role` 只能是 3 个值， `system`、`user` 和 `assistant`
- `system` 和 `assistant` 是可选的，`user` 是必须的。

官方提供了 [playground](https://platform.openai.com/playground?mode=chat) 帮助我们创建 messages 信息。

![openai playground](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35c1ce17ffe54bd6b61324951e46b2fe~tplv-k3u1fbpfcp-watermark.image?)

`assistant` 也就是其中一次返回的数据信息。
发送的 messages 如下：

```js
const messages = [
  {
    role: 'system',
    content: '你是一名精通 typescript 的前端工程师，不需要解释',
  },
  {
    role: 'user',
    content:
      'Convert the following JSON to typescript interface without explanation\n\n{\n  "name": "Allen",\n  "age": 18\n}',
  },
]
```

比如使用上面的 messages 信息，我们就可以根据它，来创建一个 Tailwind css 代码生成器。

![openai playground 拷贝 fetch](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e7395aeaab74cf396d5539eb9d2f78e~tplv-k3u1fbpfcp-watermark.image?)

通过右键可以直接拷贝为 Node.js fetch 代码。

再来实现一个 JSON 转 Typescript 的例子

![openai playground JSON 转 Typescript](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/048e56b8e89443469214a37a1f3511ae~tplv-k3u1fbpfcp-watermark.image?)

那么我们通过以上截图的 messages，就可以创建一个 JSON 转 Typescript 生成器。

## 在 Next.js 使用

接下来，我们就在 Next.js 中创建一个全栈应用。

那为什么选择使用 Next.JS 呢？

1. 它是一个全栈框架，既可以写接口也可以使用 react 写前端；
2. 可以很轻松部署到 verel， 让我们可以直接访问 OPENAI 的接口，摆脱网络限制。

这里我选择使用大圣老师的[email-helper](https://github.com/shengxinjing/email-helper)模板

![创建github仓库](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97358b3e64cb461bb85005093e5c0205~tplv-k3u1fbpfcp-watermark.image?)

点击 GitHub 选择 Use this Template， 创建一个自己的仓库

![目录结构](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a597557faf540fa8be68b1564fe270a~tplv-k3u1fbpfcp-watermark.image?)

这个项目很简单，在 pages 目录下 `api/generate.ts` 用于代理请求接口。

`index.tsx` 也就是我们的主界面，一个按钮，一个请求，没有其他复杂逻辑。

接下来我们就根据它来创建一个智能的**Tailwind CSS 代码生成器**

1、首先将 messages 改成以上截图中的 message

2、然后将需要生成的变量存到 state 中，我们就可以实现如下界面

![Tailwind CSS 代码生成器界面](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81421d407f4e4a7ebe0be7033dc59289~tplv-k3u1fbpfcp-watermark.image?)

点击生成代码就可以 让 ai 帮我们写代码了。

这个界面，有些单调，可以在这个页面上列一些常用的组件，那么也可以直接使用 chatGPT 来生成。

![chatGPT 生成组件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4294a3e86b04fcba87750af06168ba5~tplv-k3u1fbpfcp-watermark.image?)

将 GPT 回答直接转换成 JSON 数据

![chatGPT 转 JSON 数据](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ab9ad38ad9f481cacd9dcc989021f0a~tplv-k3u1fbpfcp-watermark.image?)

将数据渲染到页面中，就可以生成快捷标签了

![实现效果](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b2a4e43a37849f88c3268748fd0af87~tplv-k3u1fbpfcp-watermark.image?)

接下来，再将 Tailwind css 的颜色，作为我们的变量，同样使用 GPT 来生成数据

![生成 Tailwind 颜色](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d2d3f014c9a4d89b6a2b14706d71858~tplv-k3u1fbpfcp-watermark.image?)

用同样的方式，转化成 JSON，拷贝到我们的代码中。

![Tailwind CSS 代码生成器效果](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22953d0bc5014037a9c74b4aac6df6dd~tplv-k3u1fbpfcp-watermark.image?)

最后一步，我们需要实现一个预览效果，这样的话，就可以所见即所得，根据效果，直接拷贝想要的代码。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7950bdddf1c04b50b5e3a9564c9eaf1c~tplv-k3u1fbpfcp-watermark.image?)

## 小结

本文介绍了 openai 的 api 使用方法，以及如何使用 openai 的 playground 生成需要的 messages 信息。并且通过一个 Next.js 实战例子，结合 ChatGPT 开发了一个 Tailwind CSS 代码生成器。

## 最后

贴一下文本的代码仓库和预览地址

代码仓库：https://github.com/maqi1520/openai-helper

预览地址：https://openai.maqib.cn/

如果对你有帮助，记得给个三连，感谢你的阅读。

---

**_本文正在参加[「金石计划」](https://juejin.cn/post/7207698564641996856/ 'https://juejin.cn/post/7207698564641996856/')_**
