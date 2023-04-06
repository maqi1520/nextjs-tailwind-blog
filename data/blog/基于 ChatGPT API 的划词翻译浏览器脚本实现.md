---
title: 基于 ChatGPT API 的划词翻译浏览器脚本实现
date: 2023/3/28 18:05:49
lastmod: 2023/4/6 09:03:49
tags: [JavaScript]
draft: false
summary: 最近 GitHub 上有个基于 ChatGPT API 的浏览器脚本，openai-translator， 短时间内 star 冲到了 9.7k， 功能上除了支持翻译外，还支持润色和总结功能。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c93edb619cb4edf949b9d1bf91662a0~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

最近 GitHub 上有个基于 ChatGPT API 的浏览器脚本，[openai-translator](https://github.com/yetone/openai-translator)， 短时间内 star 冲到了 9.7k， 功能上除了支持翻译外，还支持润色和总结功能，除了浏览器插件外，还使用了 tauri 打包了一个桌面客户端，那抛开 tauri 是使用 rust 部分，那浏览器部分实现还是比较简单的，今天我们就来手动实现一下。

## openAI 提供的接口

比如我们可以复制以下代码，在浏览器控制台中发起请求，就可以完成翻译

```js
//这是示例
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

上述代码中 OPONAI_API_KEY 需要替换成你自己的。

## 实现划词翻译

划词翻译是一种常见的网页功能，用户选择一个单词或一段文本时，自动弹出一个小窗口，显示该单词或文本的翻译。

1.  首先，在 HTML 页面中添加一个空的 DIV 元素和一个触发翻译的按钮

```js
let keyword
const translation = document.createElement('div')
translation.id = 'translation'
const icon = document.createElement('img')
icon.style.width = '30px'
icon.style.height = '30px'
icon.src = 'http://example.com/icon.png'
translation.appendChild(icon)
```

2.  为页面添加一个鼠标抬起事件监听器，当用户选择一段文本时，设置搜索关键词。

```javascript
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    keyword=selection；
  }
});
```

3.  鼠标点击执行翻译逻辑。可以使用 AJAX 请求从后台获取翻译结果并将其显示在 DIV 元素中。

```javascript
function translate() {
  if (keyword) {
    // 执行翻译逻辑
  }
}
icon.addEventListener('mouseover', translate)
```

4.  在 CSS 样式表中为 DIV 元素添加样式，使其浮动在页面上显示。

```css
#translation {
  position: fixed;
  top: 10px;
  right: 10px;
  max-width: 300px;
  padding: 5px;
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}
```

以上这些步骤就能实现划词翻译的基本功能，一起来看下效果。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef50c80c611d4a7ab7e5df25cd538ab4~tplv-k3u1fbpfcp-zoom-1.image)

## react + antd 实现

上面的代码只是实现了一个最简单的版本，样式也不够美观，因此我们可以使用 webpack + react + antd 来实现一个现代化的插件， 这里我使用一个之前创建的模版[tampermonkey-starter](https://github.com/maqi1520/tampermonkey-starter)。

使用 antd 的 Popover 组件来显示，使用 react 重构下 js 代码，我们就可以实现如下效果。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f377e92032b41bfb7f3afe2d25a9de6~tplv-k3u1fbpfcp-watermark.image?)

点击翻译按钮，就会通过接口请求，将翻译结果显示在下方。但是翻译结果需要等 api 完全返回，才会显示出来，这样会等待较慢，我们可以使用 Stream，OpenAI 的接口支持流渲染吗，这样结果就会一个字一个字蹦出来。

```js
import { createParser } from 'eventsource-parser'

const translate = async (text: string) => {
  const resp = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: `Translate this into Chinese:
          ${text}`,
      max_tokens: 1000,
      temperature: 0,
      frequency_penalty: 0,
      stream: true,
    }),
  })
  if (resp.status !== 200) {
    const res = await resp.json()
    setLoading(false)
    console.error(res)
    return
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      const data = event.data
      if (data === '[DONE]') {
        setLoading(false)
      }
      try {
        let json = JSON.parse(event.data)
        setResult((prev) => {
          return prev + json.choices[0].text
        })
      } catch (error) {
        console.log(error)
      }
    }
  })
  const data = resp.body
  if (!data) {
    console.log('Error: No data received from API')
    return
  }
  const reader = resp.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        setLoading(false)
        break
      }
      const str = new TextDecoder().decode(value)
      parser.feed(str)
    }
  } finally {
    reader.releaseLock()
  }
}
```

在上面代码中，我们使用 `fetch` API 发送了一个 HTTP 请求，并在响应中获取了一个可读流。我们可以使用 `getReader` 方法获取一个读取器对象，并使用它来处理流数据，使用了 `eventsource-parser`这个包来解析服务器推送（[Server-sent events](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)）的数据。

这样响应的内容就会根据 Server-sent events（服务器发送的事件）逐个显示了。

![2023-03-27 13-41-49.2023-03-27 13_46_07.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f0a5e6a03ee4e80928682f47f803948~tplv-k3u1fbpfcp-watermark.image?)

## 文本转语音

一般翻译插件都有语音播放的功能，我们可以利用 可以使用 Web Speech API。此 API 提供了两个语音合成接口：`SpeechSynthesis`和`SpeechSynthesisUtterance`

```js
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = speechSynthesis.getVoices()[0]
    utterance.pitch = 1
    utterance.rate = 1
    speechSynthesis.speak(utterance)
  }
}
```

然后直接调用这个函数，传入需要朗读的文本，就可以实现语音播放

```js
speak('Hello, world!')
```

## 小结

本文介绍了如何实现划词翻译的基本功能，包括使用 OpenAI 提供的接口进行翻译、在 HTML 页面中添加触发翻译的按钮和鼠标抬起事件监听事件、使用 AJAX 请求从接口获取翻译结果并将其显示在 DIV 元素中等。同时还介绍了如何使用 webpack + react + antd 实现一个现代化的插件，并利用 Web Speech API 实现语音播放功能。

**_本文正在参加[「金石计划」](https://juejin.cn/post/7207698564641996856/ 'https://juejin.cn/post/7207698564641996856/')_**
