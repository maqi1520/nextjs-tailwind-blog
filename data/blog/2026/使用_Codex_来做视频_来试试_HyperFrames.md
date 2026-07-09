---
title: 使用 Codex 来做视频，来试试 HyperFrames
date: '2026/5/8'
lastmod: '2026/5/8'
tags: [公众号]
draft: false
summary: '做视频不一定要用 Premiere 、剪映等剪辑软件了，'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloZnCPAUL4alNLqOFXDG21ibI4CYERBVeD9kDibsQNuE1BkvxYNgKAEo9TQicEIwzibeC1I8NicJu8su2bReVehsZXKiagxQ3EwEHibib0/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: 使用-codex-来做视频来试试-hyperframes
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloZnCPAUL4alNLqOFXDG21ibI4CYERBVeD9kDibsQNuE1BkvxYNgKAEo9TQicEIwzibeC1I8NicJu8su2bReVehsZXKiagxQ3EwEHibib0/640?wx_fmt=png&from=appmsg)

做视频不一定要用 Premiere 、剪映等剪辑软件了，  
最近一个叫  **HyperFrames**  的开源框架在 X 上很火，思路挺清奇：你用 HTML + CSS + GSAP 写动画，它直接渲染成 MP4。因此我们可以让 ai 来做视频。

说白了就是，前端开发者那套技能，原封不动搬来拍视频。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrEduPJV98rAWSFQnGx5adUYqTZGPoEoFQPhDIR5ntBCDWwjFRszUy1eibDWnnH9lLMMQED2saKut0H4mib4FSbME9iaYE1Y0gGoo/640?wx_fmt=png&from=appmsg)

用 HTML 写视频的手绘示意图

## 先看看它能干什么

装好之后，`npx hyperframes`  会给你一组命令。分几类：

做视频的核心流程：

    init       # 脚手架新建项目capture    # 捕获一个网站，自动提取颜色、字体、素材preview    # 在浏览器里实时预览render     # 渲染成 MP4 或 WebMlint       # 检查 HTML 结构有没有问题validate   # 在无头 Chrome 里跑一遍，检查运行时错误snapshot   # 按时间点截 PNG 关键帧inspect    # 检查视觉布局，看有没有文字溢出重叠

跟音视频相关的：

    tts         # 文字转语音，本地跑 Kokoro-82M 模型transcribe  # 语音转文字时间戳，用的是 Whisperremove-background # 去背景，输出透明视频

这东西有意思的地方在于，**每个 composition 就是一个 HTML 文件**。你在浏览器里怎么调动画，渲染出来就是什么样。GSAP 时间线直接对应视频时间轴，`data-start`  和  `data-duration`  控制每段素材什么时候出现、播多久。

## TTS 和转写的原理

这两个功能我专门看了一下。

**TTS**  用的是 Kokoro-82M，一个 8200 万参数的本地语音模型，走 ONNX Runtime。完全离线，不需要 API key。效果比不上 ElevenLabs 这种商业服务，但胜在免费、简单、能直接跑。支持的语音有十几个，中英文都有。

命令长这样：

    npx hyperframes tts SCRIPT.md --voice af_nova --output narration.wav

不过内置 TTS 的中文效果我基本没法用，尤其是语气和断句，很难直接放进成片里。我后来换成火山引擎的豆包语音，先在外面生成音频，再把下载好的音频丢给 Codex，后面的转写、字幕和时间线都能继续接上。

**转写**用的是 Whisper，不过是在本地跑的 whisper.cpp，数据不会上传。默认模型是  `small.en`，速度和准确率比较均衡。如果音频背景里有音乐，可以切到  `medium.en`。

    npx hyperframes transcribe narration.wav

出来的  `transcript.json`  是逐词时间戳，每个词都有开始和结束时间：

    [  { "text": "Markdown", "start": 0.0, "end": 0.65 },  { "text": "不该", "start": 0.65, "end": 1.15 },  { "text": "只", "start": 1.15, "end": 1.38 },  { "text": "停在", "start": 1.38, "end": 1.9 },  { "text": "文档里", "start": 1.9, "end": 2.8 }]

这个时间戳文件很关键。它相当于整条视频的节奏骨架：每幕什么时候开始、什么时候结束，字幕怎么跟着语音走，都可以从这里取。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlqLW9tL4JKCVOia74WBwrpuvxQzw8GuicN98H4luTEzxGcpZsSmvPiaYQ5kOn2ygiaC4jIImVBPQVHD4NvLj4RQsRlowIiamrHiahgYg/640?wx_fmt=png&from=appmsg)

TTS、音频和转写时间戳的手绘流程图

## 整条工作流长这样

我使用的是这个内置脚本  `Website to HyperFrames`

实际做一条视频，大概是 7 步：

1

**捕获网站**：如果是做产品宣传片，`npx hyperframes capture`  可以把网站截图、颜色、字体、素材都抓下来。

2

**确定设计**：写一个  `DESIGN.md`，把品牌色、字体、组件风格固定住。

3

**写脚本**：先写旁白文案，因为文案会决定视频节奏。

4

**写分镜**：拆成一幕一幕，规划每一幕的画面、动画、过渡、音效。

5

**生成配音**：用 TTS 生成  `narration.wav`，再转写成  `transcript.json`。

6

**构建画面**：写 HTML + CSS + GSAP 动画，每一幕一个 composition。

7

**检查交付**：依次跑  `lint`、`validate`、`snapshot`、`preview`，确认没问题后再  `render`  成视频。

我也试了用 Codex 里的 Website to HyperFrames 直接把网站做成视频。效果没有想象中那么强，离“丢一个网址进去就自动出片”还有距离，但拿来生成初版素材挺方便：截图、色彩、页面结构都能先铺出来，后面再手动改分镜和动画，省掉不少从零搭画面的时间。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlo6DURoicaXHXbQJTiaQ98oiaqC3VOyROia259DzK6VTXtcSrYkND0AxwaDMZU0rJM3Re3QEJXx8tU6VuAdTobaBzibxEKaWa4UOZxg/640?wx_fmt=png&from=appmsg)

HyperFrames 视频制作工作流手绘图

比较舒服的一点是，每一步都有明确产物。上一步的输出就是下一步的输入，不会做着做着突然不知道该干什么。

一个典型项目目录大概长这样：

    my-video/  DESIGN.md  SCRIPT.md  STORYBOARD.md  index.html  narration.wav  narration.txt  transcript.json  capture/    screenshots/    assets/    extracted/  compositions/    beat-1-hook.html    beat-2-proof.html    beat-3-close.html  snapshots/  renders/

## 几个容易踩坑的细节

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlrdzH2MZdN99RQcTtuV4qvHiauJf22n2QIGHUGN83Ksv9J3zzoa5vOOL9TKqmK6bhY9PiaYpwfYHLIOlYENicibJicUsn4DQiat0Sp2w/640?wx_fmt=png&from=appmsg)

HyperFrames 常见坑位手绘图

**不要随手用  `Math.random()`。** HyperFrames 追求确定性渲染，同一份代码每次导出应该完全一致。如果需要随机效果，用带种子的随机函数。

**GSAP 时间线不要写  `repeat: -1`。**  视频渲染需要一个确定的终点，无限循环很容易让渲染过程出问题。想循环就算好时长，写成有限次数。

**不要用 CSS `transform`  做居中。** GSAP 经常也会操作  `transform`，两边一抢，元素位置就可能乱。居中这种事用 flexbox 或 grid 更稳。

**Tailwind 可以直接用。**  新建项目时加上：

    npx hyperframes init my-video --tailwind

之后就可以在 composition 里写 Tailwind utility class。

## 它适合谁

如果你是前端开发者，想给产品做一条宣传视频，或者做一些动态内容，但又不想为了这个去学 After Effects，那 HyperFrames 还挺合适。

它不是要替代 Premiere 或 AE。复杂的真人实拍、多轨剪辑、重度后期，专业软件还是专业软件。

但很多时候，你需要的其实是一条 15 秒或 30 秒的产品视频：几个镜头、一些文字、一点动效、一个配音。为了这个打开 AE 学一周，成本确实有点高。

这时候  `npx hyperframes`  的思路就很直接：用你已经熟悉的 HTML、CSS、GSAP，把画面写出来，然后渲染成视频。

我觉得这类工具最有意思的地方，不是“前端终于能做视频了”这种口号，而是它把视频生产拆回了可编程的状态。脚本是文件，分镜是文件，配音是文件，时间戳是 JSON，画面是 HTML。

这对开发者来说, 偶尔需要在社交媒体上发一个视频，也是一个不错的选择。

最后，贴一下本次生成视频。
