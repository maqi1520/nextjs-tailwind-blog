---
title: 如何使用Codex做出更有细节的网站
date: '2026/5/24'
lastmod: '2026/5/24'
tags: [AI 编程]
draft: false
summary: '最近我在尝试用 Codex 做一个更好看的网页，发现一个比较实用的流程：不要一上来就让它照着某个网站直接生成页面，而是先让 GPT Image2 帮你把设计稿和素材准备好，再交给 Codex 去实现。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloicSriaIqAoic9XsTPR30eprXTIO0pKlQg3uLVEsfcRxHlrHTRTNYBxsvjfSXG9X7EkKwc9H6uNLSDjjeAx3Lz58DNRHVT9icl0v8/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: 如何使用codex做出更有细节的网站
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloicSriaIqAoic9XsTPR30eprXTIO0pKlQg3uLVEsfcRxHlrHTRTNYBxsvjfSXG9X7EkKwc9H6uNLSDjjeAx3Lz58DNRHVT9icl0v8/640?wx_fmt=png&from=appmsg)

最近我在尝试用 Codex 做一个更好看的网页，发现一个比较实用的流程：不要一上来就让它照着某个网站直接生成页面，而是先让 GPT Image2 帮你把设计稿和素材准备好，再交给 Codex 去实现。

很多时候，我们会去一些设计参考网站上找灵感，比如 GetDesign.md 这类网站。里面有很多网页效果图，风格、排版、配色都可以拿来参考。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrcqVMDjerUEPQK3XM8xvQZFygBia8qQXeOsS8NeTeOlHS8PQbgibZ9Qg8LSuia9ibb1icibTve3XVAEzyu6KXSEQ4VInHJFEIL6Vnb8/640?wx_fmt=png&from=appmsg)

但如果你只是把参考图和提示词丢给 Codex，让它直接模仿，它通常只能生成一个相似的风格。页面结构可能接近，色彩和布局也差不多，但里面真正让页面变丰富的图片素材、装饰元素、插画、图标，很难使用 HTML 还原出来。

所以我现在会换一种做法。

我会先在 Codex 里使用 superpower 这个技能和它头脑风暴，确定我想要的网站结构。比如页面应该有哪些区块，首屏展示什么，下面有哪些内容模块，整体结构怎么组织。

等结构差不多确定后，我会让 Codex 生成一份 ASCII 码式的结构草图。它不需要很复杂，只要能把页面层级、模块关系和大致布局表达清楚就行。

然后我会把这份 ASCII 码发给 ChatGPT，让它基于这个结构生成一张网站设计效果图。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlrct7iccvRhsiaoHWlnPI5DIIz7UKusuias5ugqwjTmxJsAuBbctseZR63YrwrGzqGnqv68VyBzt7sEJz027EpBia7QyibvaGbCzEho/640?wx_fmt=png&from=appmsg)

这一步很关键。

因为有了设计稿之后，我们就能看到具体的页面，能看到页面里具体的素材。比如背景图、卡片里的小插画、按钮旁边的图标、某个模块里的装饰元素。也能够确定做出这个网站是否是我们想要的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlpWO9ibKfzmVFV6e5FCnvKocBm5RBYygvfm1KzKsLg8KibOxMhpJ7OIBpfm0RukDXz9A69225VknWl9FcxgbKzfmSCaKicibEyGhUw/640?wx_fmt=png&from=appmsg)

如果我对 ChatGPT 生成的设计稿比较满意，就会继续让它根据图片里的素材，把需要的图片元素单独切出来，并提供一个 ZIP 包下载地址。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlpBK57SXk0NAH6XV7iarxjIq0uiaPdm7uIalKm9GibPz9WXD5pNLOtTIvcrcOWRGnb5EjNMLEEHmaicSuORFHIRabVKn6kkm7pQTL8/640?wx_fmt=png&from=appmsg)

这样我就能把所有素材下载下来，再丢给 Codex，让它根据这些素材生成 HTML 页面。

这个流程做出来的效果会更完整。Codex 不再只是模仿一个大概的风格，而是有了明确的页面结构和真实可用的素材，最后生成的网页会更接近设计稿，也更容易达到预期。

HTML 完成之后，如果页面已经基本成型，我还会继续让 Codex 对一些细节组件做拆分和优化。比如某个卡片、导航、内容区块，单独拿出来细化，让它一点点把页面和功能交互补完整。

简单说，我现在的流程是：

先用 superpower 头脑风暴确定网站结构，再用 ChatGPT 生成设计稿和素材，最后把素材交给 Codex 实现页面。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlqdFoKa5rrKgiakQy1ZE33swibTkwSV50HP7tPw5PDUz9BXRAnmfpcB7grTEltNbZyNjtmUz3ycatZKFZU3ABsB7gEVfKw7nxrSc/640?wx_fmt=png&from=appmsg)

这样做比直接让 Codex 模仿一个网页更稳，也更容易做出有细节、有素材、有完成度的页面。
