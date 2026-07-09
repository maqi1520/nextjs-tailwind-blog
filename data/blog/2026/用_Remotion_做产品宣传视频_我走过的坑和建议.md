---
title: 用 Remotion 做产品宣传视频，我走过的坑和建议
date: '2026/2/14'
lastmod: '2026/2/14'
tags: [公众号]
draft: false
summary: '最近我上线了我的新产品 vibe2design，然后就想——能不能自己做几个产品宣传视频？毕竟 remotion-best-practices 爆火，周安装量 89.0K。那咱就试试呗。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlocJGuS63bhUCGUFhORGeMQ894PZRxmJlL6S8ibQCNe2g76XhybX14q7tMUgaRCfqfL8xI2U9elYEAvyzQkRMrJX7T3rUWdUb74/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: 用-remotion-做产品宣传视频我走过的坑和建议
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlocJGuS63bhUCGUFhORGeMQ894PZRxmJlL6S8ibQCNe2g76XhybX14q7tMUgaRCfqfL8xI2U9elYEAvyzQkRMrJX7T3rUWdUb74/640?wx_fmt=png&from=appmsg)

嗨大家好，我是小马。

最近我上线了我的新产品 vibe2design，然后就想——能不能自己做几个产品宣传视频？毕竟 remotion-best-practices 爆火，周安装量 89.0K。那咱就试试呗。

于是我就开始了 Remotion 视频制作之旅。怎么说呢，整个过程还是挺有意思的，也踩了一些坑。今天就来聊聊我的经验和教训。

---

## 我的第一个视频，翻车了

说实话，第一次做的时候效果特别普通。就是那种常见的 PPT 轮播，加几个简单的转场，看起来毫无吸引力。

因此也就完全没有保存的必要。

但是没关系，重新来嘛。这次我学乖了，经过几个小时的反复调整，终于做出了一个让我满意的版本。

说实话，看到成品的时候我还是挺惊喜的。原来 AI 做视频还能这么玩。

---

## 几点踩坑经验

### 第一，模型选择真的很重要

一开始我用的是  `minimax`，结果连项目都跑不起来，视频静态资源全是错误。我猜可能是因为 Remotion 在国内用得少，训练语料不够？

后来换成  `gemini-3-pro`，终于能正常跑了。所以建议大家一开始就选对模型，别浪费时间在跑不动的方案上。

### 第二，先写脚本，别急着动手

我第一次就是直接让 Claude Code 根据一篇公众号文章生成视频，结果出来的东西总是差点意思。

后来我想明白了，最好的方法是：先让 AI 帮你列一个大纲和视频脚本。把每一页要展示什么、说什么词儿都定下来，然后再动手做。

这样后面返工的概率会小很多。

### 第三，素材提前准备好

视频脚本定好之后，别急着写代码。先把素材准备好放到 public 目录下，比如：

产品截图

操作录屏

需要的图标图片

这些素材的质量直接影响最终效果。

### 第四，先做 HTML 风格稿确认视觉

这个是我后来学到的技巧：用 Gemini 把视频的每个场景生成为 HTML 页面，用 tailwindcss 排版。这样在正式生成视频之前，你就能看到每个场景的样子，确认风格是不是你想要的。

比如这是我自己用的颜色策略参考：

    颜色策略：使用了 #0B0C15 这种极深的蓝灰色作为背景，比纯黑更有质感文字用不同深度的灰色（text-gray-300, text-gray-400）来建立视觉层级重点色保留紫色/橙色渐变，应用在文字高亮、按钮发光边框、背景模糊光斑上标题非常巨大且居中，用渐变色

关键是这一步可以**快速迭代**，不用等视频渲染完了才发现风格不对。

### 第五，打字机效果 yyds

就这一句提示词，让我想要的效果直接到位：

> 场景演示文字标题和描述，采用打字机效果。

有时候一个简单的动效，就能让整个视频生动很多。

### 第六，BGM 和音效自己找

这部分 Claude Code 虽然能帮你生成提示词（比如用 Suno 生成 BGM 提示词），但下载的事情我还是建议你自己来。

任意选一个风格生成就行，在 Suno 上生后，成选择一个满意的即可。

让 AI 上网下载音乐，经常会因为网络原因失败，白白浪费 token。我的做法是：让 AI 给我生成搜索词和提示词，然后我自己去下载。

---

## 关于导出

Remotion 渲染视频的时候默认会下载一个专门的 Chrome Headless Shell，但这东西在国内网络环境下经常下载失败，提示什么  `read ECONNRESET`  连接不上  `storage.googleapis.com`。

解决方案很简单——告诉 Remotion 用你本地已经装好的 Chrome：

    npx remotion render src/index.ts MyComp out/video.mp4 --browser-executable "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

Mac 用户直接把路径换成你自己的 Chrome 位置就行。

## 写在最后

总的来说，用 Remotion 做产品视频这条路是可行的。关键是要有耐心，多迭代几次。

我个人的感受是：AI 工具是挺强，但也不是甩手掌柜。前期的脚本规划、素材准备、视觉风格确认，这些功课做足了，后面 AI 帮你生成的视频质量才会高。

如果你也打算用 Remotion 做产品宣传，希望我的经验能帮你少走点弯路。

有问题欢迎交流，咱们下次再聊。
