---
title: ChatGPT 以及相关开源项目体验
date: 2022/12/12 22:55:57
lastmod: 2023/1/25 11:42:11
tags: [前端, OpenAI, 掘金·金石计划]
draft: false
summary: 本月初，ChatGPT 以惊人的速度问世，在技术圈中引起了广泛讨论。在 GitHub 上近期还诞生了多个 ChatGPT 相关的开源项目，数量之多令人瞠目结舌。
images: https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/361b95e87f774692a2c0cf5924a28d6d~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

本月初，ChatGPT 以惊人的速度问世，在技术圈中引起了广泛讨论。在 GitHub 上近期还诞生了多个 ChatGPT 相关的开源项目，数量之多令人瞠目结舌，甚至 ChatGPT 独霸了大半个 GitHub Trending，那么，它究竟有什么样的魅力，让诸多开发者如此激动不已呢？让我们一起来探究一下。

## 注册

目前，ChatGPT 在国内无法直接注册，访问需要通过代理，并且需要使用其他国家的手机号注册，具体注册方法，大家可以看下[这篇文章](https://juejin.cn/post/7173447848292253704 'OpenAI 推出超神 ChatGPT 注册攻略来了')

## 功能体验

ChatGPT 可以实现诸如智能聊天、诗歌、写作、编程、改 Bug、撰写周报、知乎问答等工作。

比如我可以使用它来写

1、前端组件

> 使用 React hooks 写一个 echarts 组件

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4cb635f78a84af7929a4e3a954dd6d3~tplv-k3u1fbpfcp-zoom-1.image)

上面代码实现基础的组件，并没有给出示例代码，我们可以继续追问

> 给一个折线图的 options 示例

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39491a17e47b44cf8eaf3e512d30743c~tplv-k3u1fbpfcp-zoom-1.image)

2、优化周报

> 优化上周周报，使其更加丰富

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5a108ae9b8041d9a95506d7260279d7~tplv-k3u1fbpfcp-zoom-1.image)

在周报上，不但帮我优化了内容，还帮我安排了下周工作，大家觉得 ChatGPT 整理的如何呢？

笔者认为，它虽不是完美，但在给出关键词之内给出的回答，这些已经非常让人出乎意料了。

更多体验，大家可以自行探索下，下面我们来看看 GitHub 上关于 ChatGPT 的项目。

## Node.js API 接口

前端工程师对 Nodejs 比较熟悉，[官网](https://beta.openai.com/docs/api-reference/completions/create)就有 nodejs 的接口

**openai**

首先通过 npm 安装 openai

```bash
npm install openai
```

然后可以在任意接口中使用以下代码

```js
const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
const response = await openai.createCompletion({
  model: 'text-davinci-003',
  prompt: '你好',
  max_tokens: 255,
  temperature: 0.5,
})

// 打印 API 返回的结果
console.log(response.data.choices[0].text)
```

- `createCompletion` 的意思是自动完成，它跟官网的回话方式一致；

- `max_tokens` 最大的令牌数量，可以理解为返回的字符数量，大多数内容 2048 内，当然 max_tokens 返回接口的速度越慢。

- `temperature`： 0-1 之间，温度参数表示生成文本中的随机性或不可预测性程度。较高的温度值将产生更具创造性和多样性的输出，而较低的温度值会产生更可预测和重复的文本。

- `OPENAI_API_KEY` 可以通过[View API keys](https://beta.openai.com/account/api-keys) 页面生成。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2be906c0ca0a482f895fe81adf792edb~tplv-k3u1fbpfcp-zoom-1.image)

**chatgpt**

另一个是个人开发的项目，它将 ChatGPT 的 API 进行了二次封装，让定制化开发变得更加方便。

通过 npm 安装 chatgpt。

```bash
npm install chatgpt
```

```js
import { ChatGPTAPI } from 'chatgpt'

async function example() {
  // sessionToken is required; see below for details
  const api = new ChatGPTAPI({
    sessionToken: process.env.SESSION_TOKEN,
  })

  // ensure the API is properly authenticated
  await api.ensureAuth()

  // send a message and wait for the response
  const response = await api.sendMessage('Write a python version of bubble sort.')

  // response is a markdown-formatted string
  console.log(response)
}
```

`SESSION_TOKEN` 值需要登录账号后，通过 chome 控制台复制出来。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c520af5430c841328f6e7f1bf5f3b472~tplv-k3u1fbpfcp-zoom-1.image)

GitHub：https://github.com/transitive-bullshit/chatgpt-api

- chatgpt 模拟的是 ChatGPT 网页版，需要使用 node 服务器（一般来说是海外的），使用了 stream ，当前尝试还无法部署到 vercel

- openai 是官方提供的包，可以部署到 vercel 环境，但是返回受到了时间限制和字数限制，需要将 max_tokens 值设置小一些，这样会导致回复不完整。

## 微信聊天助手

### WeChat GPT

这个项目基于 wechaty ，让你快速通过微信聊天窗口，发起与 ChatGPT 的对话。

在使用之前，需先配置 OpenAI 的`Session Token`信息，以及对应的「关键词」触发。

![功能特性](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91de47747bb84ab49ac9c6823a66f584~tplv-k3u1fbpfcp-zoom-1.image)

![接入公众号](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ac5831a388f45b781d36bb7005b6045~tplv-k3u1fbpfcp-zoom-1.image)

GitHub：https://github.com/fuergaosi233/wechat-chatgpt

### WeChat Bot

一个 基于 chatgpt + wechaty 的微信机器人，可以用来帮助你自动回复微信消息，或者管理微信群/好友，简单，好用，2 分钟 就能玩起来了，

git 克隆项目后执行 `npm install`，修改 env 相关配置，

然后根据你的需求，自己修改相关逻辑文件

![修改配置](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f12756fe93a4e018a0b89d52f6d4cb6~tplv-k3u1fbpfcp-zoom-1.image)

便可以扫码登录

![扫码登录](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f337ab3242004f348dbdab603757a906~tplv-k3u1fbpfcp-zoom-1.image)

这是实际使用效果：

![微信接入演示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87128f65e0e846eabd0b7785e66177f5~tplv-k3u1fbpfcp-watermark.image?)

GitHub：https://github.com/wangrongding/wechat-bot

## 浏览器插件

### ChatGPT for Google

这款插件支持 Chrome / Edge / Firefox 等浏览器。

在安装之后，除了会在浏览器正常展示 Google 搜索内容，还会在右侧展示 ChatGPT 反馈结果，可以进一步提升搜索效率。

![搜索演示](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52d3cee74a73421bb0c06e6c25fb5ba4~tplv-k3u1fbpfcp-watermark.image?)

GitHub：https://github.com/wong2/chat-gpt-google-extension

### ChatGPT Chrome Extension

这是专为 Chrome 用户开发的一款 ChatGPT 插件。

安装之后，在任意页面文本框中点击右键，即可弹出「Ask ChatGPT」的选项。

ChatGPT 会根据当前文本框中的内容，进行搜索。这个的扩展还包括一个插件系统，可以更好地控制 ChatGPT 的行为，并能够与第三方 API 交互。

![插件演示](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81e0359cca40494595cf475f41c0e89e~tplv-k3u1fbpfcp-watermark.image?)

GitHub：https://github.com/gragland/chatgpt-chrome-extension

## 油猴脚本

来自台湾的 Will 保哥 ，可以将 ChatGPT 变为你的语言助手，实现了语音输入和自动朗读功能。通过浏览器自带的 [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)，让我们告别打字模式。

他在 [B 站有视频讲解](https://www.bilibili.com/video/BV12P411K7gc/?vd_source=93efb77f3c9b0f1580f0a8d631b74ce2 'ChatGPT 语音油猴脚本')，大家可以观看下，非常有意思。

GitHub：https://github.com/doggy8088/TampermonkeyUserscripts

## 逆向工程

任何让工程师充满好奇心的项目，都逃不过逆向，在这一点上，ChatGPT 也不例外。

GitHub 上一位来自马来西亚的开发者 Antonio Cheong，在 ChatGPT 发布没多久后，便对其进行了逆向，成功提取了 API。

有了这些 API，我们便可以自行开发一款好玩的聊天机器人、AI 智能助手、代码辅助工具等应用。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11109a890b9648c7b098f92582d143ab~tplv-k3u1fbpfcp-zoom-1.image)

GitHub：https://github.com/acheong08/ChatGPT

## Mac 软件

为 Mac 用户量身定制了一款小工具：ChatGPT for desktop，支持 M1 和 Mac Intel，安装之后，可通过 `Cmd+Shift+G` 快捷键，快速在系统菜单栏启动 ChatGPT。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f7201753ce14bb28e59736255b3bbfb~tplv-k3u1fbpfcp-zoom-1.image)

GitHub：https://github.com/vincelwt/chatgpt-mac

## 最后

对于前端工程师来说，我们可以使用 api 将 ChatGPT 集成到自己的应用中，所以说了解 nodejs 和 docker 相关知识，是很有必要的。

它的优点是语言组织能力非常强，并且可以结合上下文。但它给的答案也不一定正确，有时候甚至是错误的

正如官网所说，它还不能通过互联网搜索。

> Limited knowledge of world and events after 2021

对于 2021 年以后得知识了解有限。我们可以使用它来强化自己的搜索能力，至于答案是否采纳，还的自己甄辨。

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

> 本文正在参加[「金石计划 . 瓜分 6 万现金大奖」](https://juejin.cn/post/7162096952883019783 'https://juejin.cn/post/7162096952883019783')
